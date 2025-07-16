# Student Fees Management Implementation Guide

## Overview
This guide will help you implement a comprehensive student fees management system in your DopplerCoachingCenter project. The system will include fee structure management, payment tracking, receipt generation, and reporting features.

## Database Schema (Firestore Collections)

### 1. Fee Structures Collection (`feeStructures`)
```typescript
interface FeeStructure {
  id: string;
  name: string; // e.g., "Monthly Tuition", "Admission Fee", "Exam Fee"
  amount: number;
  type: 'monthly' | 'quarterly' | 'yearly' | 'one-time';
  description: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 2. Student Fees Collection (`studentFees`)
```typescript
interface StudentFee {
  id: string;
  studentId: string;
  feeStructureId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount: number;
  remainingAmount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. Fee Payments Collection (`feePayments`)
```typescript
interface FeePayment {
  id: string;
  studentId: string;
  studentFeeId: string;
  amount: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque';
  paymentDate: Date;
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
  createdBy: string; // admin/faculty ID
  createdAt: Date;
}
```

## File Structure to Add

```
app/
├── admin/
│   ├── fees/
│   │   ├── page.tsx                    # Fee overview dashboard
│   │   ├── structure/
│   │   │   └── page.tsx               # Manage fee structures
│   │   ├── payments/
│   │   │   └── page.tsx               # View all payments
│   │   ├── reports/
│   │   │   └── page.tsx               # Fee reports
│   │   └── student/
│   │       └── [id]/
│   │           └── page.tsx           # Individual student fee management
│   └── ...
├── student/
│   ├── fees/
│   │   ├── page.tsx                    # Student fee dashboard
│   │   ├── payments/
│   │   │   └── page.tsx               # Payment history
│   │   └── receipt/
│   │       └── [id]/
│   │           └── page.tsx           # View receipt
│   └── ...
└── ...

components/
├── fees/
│   ├── FeeStructureForm.tsx
│   ├── FeePaymentForm.tsx
│   ├── FeePaymentTable.tsx
│   ├── FeeReceiptGenerator.tsx
│   ├── FeeStatistics.tsx
│   └── StudentFeeOverview.tsx
└── ...

firebase/
├── fees.ts                            # Fee-related database operations
└── ...
```

## Implementation Steps

### Step 1: Create Firebase Functions for Fee Management

Create `firebase/fees.ts`:

```typescript
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from './config';

// Fee Structure operations
export const createFeeStructure = async (feeStructure: Omit<FeeStructure, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'feeStructures'), {
    ...feeStructure,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getFeeStructures = async () => {
  const querySnapshot = await getDocs(
    query(collection(db, 'feeStructures'), orderBy('createdAt', 'desc'))
  );
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Student Fee operations
export const createStudentFee = async (studentFee: Omit<StudentFee, 'id' | 'createdAt' | 'updatedAt'>) => {
  const docRef = await addDoc(collection(db, 'studentFees'), {
    ...studentFee,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  });
  return docRef.id;
};

export const getStudentFees = async (studentId: string) => {
  const q = query(
    collection(db, 'studentFees'),
    where('studentId', '==', studentId),
    orderBy('dueDate', 'asc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Fee Payment operations
export const createFeePayment = async (payment: Omit<FeePayment, 'id' | 'createdAt'>) => {
  const docRef = await addDoc(collection(db, 'feePayments'), {
    ...payment,
    createdAt: Timestamp.now()
  });
  
  // Update student fee status
  await updateStudentFeeAfterPayment(payment.studentFeeId, payment.amount);
  
  return docRef.id;
};

export const updateStudentFeeAfterPayment = async (studentFeeId: string, paidAmount: number) => {
  const studentFeeRef = doc(db, 'studentFees', studentFeeId);
  const studentFeeDoc = await getDoc(studentFeeRef);
  
  if (studentFeeDoc.exists()) {
    const currentData = studentFeeDoc.data();
    const newPaidAmount = (currentData.paidAmount || 0) + paidAmount;
    const remainingAmount = currentData.amount - newPaidAmount;
    
    let status = 'pending';
    if (remainingAmount <= 0) {
      status = 'paid';
    } else if (newPaidAmount > 0) {
      status = 'partially_paid';
    }
    
    await updateDoc(studentFeeRef, {
      paidAmount: newPaidAmount,
      remainingAmount: Math.max(0, remainingAmount),
      status,
      updatedAt: Timestamp.now()
    });
  }
};

export const getFeePayments = async (studentId?: string) => {
  let q = query(collection(db, 'feePayments'), orderBy('paymentDate', 'desc'));
  
  if (studentId) {
    q = query(collection(db, 'feePayments'), 
      where('studentId', '==', studentId),
      orderBy('paymentDate', 'desc')
    );
  }
  
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### Step 2: Create Fee Management Components

Create `components/fees/FeeStructureForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFeeStructure } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';

interface FeeStructureFormProps {
  onSuccess?: () => void;
}

export default function FeeStructureForm({ onSuccess }: FeeStructureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createFeeStructure({
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type as 'monthly' | 'quarterly' | 'yearly' | 'one-time',
        description: formData.description,
        isActive: formData.isActive
      });

      toast({
        title: 'Success',
        description: 'Fee structure created successfully',
      });

      setFormData({
        name: '',
        amount: '',
        type: '',
        description: '',
        isActive: true
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create fee structure',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Fee Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Fee Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Monthly Tuition"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Fee Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Fee description..."
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Fee Structure'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### Step 3: Create Admin Fee Management Pages

Create `app/admin/fees/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeeStructures, getFeePayments } from '@/firebase/fees';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminFeesPage() {
  const [feeStructures, setFeeStructures] = useState([]);
  const [recentPayments, setRecentPayments] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    studentsWithDues: 0,
    paymentsThisMonth: 0
  });

  useEffect(() => {
    loadFeeData();
  }, []);

  const loadFeeData = async () => {
    try {
      const [structures, payments] = await Promise.all([
        getFeeStructures(),
        getFeePayments()
      ]);
      
      setFeeStructures(structures);
      setRecentPayments(payments.slice(0, 5));
      
      // Calculate stats (implement your logic here)
      // This is a simplified example
      const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
      setStats(prev => ({ ...prev, totalRevenue }));
    } catch (error) {
      console.error('Error loading fee data:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Fee Management</h1>
        <div className="space-x-2">
          <Link href="/admin/fees/structure">
            <Button>Manage Structures</Button>
          </Link>
          <Link href="/admin/fees/reports">
            <Button variant="outline">View Reports</Button>
          </Link>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertCircle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Amount</p>
              <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Students with Dues</p>
              <p className="text-2xl font-bold">{stats.studentsWithDues}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold">{stats.paymentsThisMonth}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fee Structures */}
      <Card>
        <CardHeader>
          <CardTitle>Fee Structures</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {feeStructures.map((structure) => (
              <div key={structure.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{structure.name}</h3>
                  <p className="text-sm text-gray-600">{structure.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={structure.type === 'monthly' ? 'default' : 'secondary'}>
                    {structure.type}
                  </Badge>
                  <span className="font-semibold">₹{structure.amount}</span>
                  <Badge variant={structure.isActive ? 'default' : 'destructive'}>
                    {structure.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Receipt #{payment.receiptNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.paymentDate.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{payment.paymentMethod}</Badge>
                  <span className="font-semibold">₹{payment.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 4: Create Student Fee Dashboard

Create `app/student/fees/page.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getStudentFees, getFeePayments } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, DollarSign, Receipt, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export default function StudentFeesPage() {
  const { user } = useAuth();
  const [fees, setFees] = useState([]);
  const [payments, setPayments] = useState([]);
  const [totalDue, setTotalDue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFeeData();
    }
  }, [user]);

  const loadFeeData = async () => {
    try {
      const [studentFees, feePayments] = await Promise.all([
        getStudentFees(user.uid),
        getFeePayments(user.uid)
      ]);
      
      setFees(studentFees);
      setPayments(feePayments);
      
      const due = studentFees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
      setTotalDue(due);
    } catch (error) {
      console.error('Error loading fee data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'default';
      case 'partially_paid': return 'secondary';
      case 'overdue': return 'destructive';
      default: return 'outline';
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Fees</h1>
        <Link href="/student/fees/payments">
          <Button variant="outline">Payment History</Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="flex items-center p-6">
            <DollarSign className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Due</p>
              <p className="text-2xl font-bold">₹{totalDue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <Receipt className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Paid</p>
              <p className="text-2xl font-bold">
                ₹{payments.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-6">
            <AlertTriangle className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold">
                {fees.filter(f => f.status === 'overdue').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Fees */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Fees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fees.filter(fee => fee.status !== 'paid').map((fee) => (
              <div key={fee.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{fee.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {new Date(fee.dueDate.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant={getStatusColor(fee.status)}>
                    {fee.status.replace('_', ' ')}
                  </Badge>
                  <div className="text-right">
                    <p className="font-semibold">₹{fee.remainingAmount}</p>
                    <p className="text-sm text-gray-600">of ₹{fee.amount}</p>
                  </div>
                </div>
              </div>
            ))}
            {fees.filter(fee => fee.status !== 'paid').length === 0 && (
              <p className="text-center text-gray-500 py-8">No pending fees</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {payments.slice(0, 5).map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-semibold">Receipt #{payment.receiptNumber}</p>
                  <p className="text-sm text-gray-600">
                    {new Date(payment.paymentDate.toDate()).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{payment.paymentMethod}</Badge>
                  <span className="font-semibold">₹{payment.amount}</span>
                  <Link href={`/student/fees/receipt/${payment.id}`}>
                    <Button variant="outline" size="sm">View Receipt</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Step 5: Update Navigation

Update your `AdminSidebar.tsx` to include fees management:

```typescript
// Add to your existing sidebar items
{
  label: 'Fees',
  icon: DollarSign,
  href: '/admin/fees',
  submenu: [
    { label: 'Overview', href: '/admin/fees' },
    { label: 'Fee Structures', href: '/admin/fees/structure' },
    { label: 'Payments', href: '/admin/fees/payments' },
    { label: 'Reports', href: '/admin/fees/reports' }
  ]
}
```

Update your `StudentSidebar.tsx`:

```typescript
// Add to your existing sidebar items
{
  label: 'Fees',
  icon: DollarSign,
  href: '/student/fees',
  submenu: [
    { label: 'Overview', href: '/student/fees' },
    { label: 'Payment History', href: '/student/fees/payments' }
  ]
}
```

## Next Steps

1. **Implement remaining pages** (fee structure management, payment forms, reports)
2. **Add receipt generation** with PDF export capability
3. **Implement payment reminders** and notifications
4. **Add fee analytics** and reporting charts
5. **Integrate payment gateways** for online payments
6. **Add bulk operations** for admin (assign fees to multiple students)
7. **Implement fee discounts** and scholarship management

This implementation provides a solid foundation for comprehensive fee management in your coaching center application. You can extend it based on your specific business requirements.
