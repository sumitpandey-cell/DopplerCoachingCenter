'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Search, Plus, TrendingUp, CreditCard, Users, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getFeePayments } from '@/firebase/fees';
import { getStudentByStudentId } from '@/firebase/firestore';
import { createFeePayment } from '@/firebase/fees';
import { getStudentFees } from '@/firebase/fees';
import { createStudentFee } from '@/firebase/fees';
import { getDocs, collection, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Loader, Skeleton } from '@/components/ui/loader';

interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  course: string;
  paymentDate: Date;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  description: string;
}

export default function AdminFinance() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPayment, setNewPayment] = useState({
    studentName: '',
    studentId: '',
    amount: 0,
    course: '',
    dueDate: '',
    paymentMethod: 'upi' as const,
    description: '',
  });

  const [studentFees, setStudentFees] = useState<any[]>([]);
  const [selectedStudentFeeId, setSelectedStudentFeeId] = useState('');
  const [showAddFeeModal, setShowAddFeeModal] = useState(false);
  const [newFee, setNewFee] = useState({
    studentId: '',
    amount: 0,
    dueDate: '',
    description: '',
    subject: '', // Add subject field
  });

  const [allStudentFees, setAllStudentFees] = useState<any[]>([]);
  const [studentNames, setStudentNames] = useState<Record<string, string>>({});
  const [studentSubjects, setStudentSubjects] = useState<string[]>([]);
  const fetchAllFees = async () => {
    const snap = await getDocs(collection(db, 'studentFees'));
    const allFees = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setAllStudentFees(allFees);
  };
  useEffect(() => {
    fetchAllFees();
  }, [showAddFeeModal]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setButtonLoading(true);
        const feePayments = await getFeePayments();
        // For each payment, fetch student name and course
        const paymentsWithStudent = await Promise.all(
          feePayments.map(async (p: any) => {
            let studentName = p.studentName || '';
            if (!studentName && p.studentId) {
              const student = await getStudentByStudentId(p.studentId);
              if (student) {
                studentName = student.fullName || '';
              }
            }
            return {
              id: p.id,
              studentName,
              studentId: p.studentId,
              amount: p.amount,
              paymentDate: p.paymentDate instanceof Date ? p.paymentDate : p.paymentDate?.toDate?.() || new Date(p.paymentDate),
              dueDate: p.dueDate instanceof Date ? p.dueDate : p.dueDate?.toDate?.() || new Date(p.dueDate),
              status: p.status || 'paid',
              paymentMethod: p.paymentMethod || 'upi',
              description: p.description || '',
            };
          })
        );
        setPayments(paymentsWithStudent);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setLoading(false);
        setButtonLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Fetch student fees when studentId changes in the add payment form
  useEffect(() => {
    const fetchFees = async () => {
      if (newPayment.studentId) {
        const fees = await getStudentFees(newPayment.studentId);
        setStudentFees(fees);
      } else {
        setStudentFees([]);
      }
      setSelectedStudentFeeId('');
    };
    fetchFees();
  }, [newPayment.studentId, showAddModal]);

  // When studentId changes, fetch their subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (newFee.studentId) {
        const student = await getStudentByStudentId(newFee.studentId);
        setStudentSubjects(Array.isArray(student?.subjects) ? student.subjects : []);
      } else {
        setStudentSubjects([]);
      }
    };
    fetchSubjects();
  }, [newFee.studentId]);

  // Debug: log studentFees when they change
  useEffect(() => { console.log('studentFees:', studentFees); }, [studentFees]);

  // Fetch student names for all fees in the pending table
  useEffect(() => {
    const fetchNames = async () => {
      const ids = Array.from(new Set(allStudentFees.map(fee => fee.studentId)));
      const names: Record<string, string> = {};
      await Promise.all(ids.map(async id => {
        if (id && !studentNames[id]) {
          const student = await getStudentByStudentId(id);
          if (student) names[id] = student.fullName || '';
        }
      }));
      setStudentNames(prev => ({ ...prev, ...names }));
    };
    if (allStudentFees.length) fetchNames();
  }, [allStudentFees, studentNames]);

  React.useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const handleAddPayment = async () => {
    // Optionally validate studentId exists here
    const receiptNumber = `RCPT${Date.now()}`;
    if (!selectedStudentFeeId) {
      alert('Please select a fee to apply this payment to.');
      return;
    }
    const paymentData = {
      studentId: newPayment.studentId,
      studentFeeId: selectedStudentFeeId,
      amount: Number(newPayment.amount),
      paymentMethod: newPayment.paymentMethod as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque',
      paymentDate: new Date(),
      dueDate: new Date(newPayment.dueDate),
      description: newPayment.description,
      status: 'paid',
      receiptNumber,
      createdBy: 'Admin',
    };
    await createFeePayment(paymentData);
    setNewPayment({
      studentName: '',
      studentId: '',
      amount: 0,
      course: '',
      dueDate: '',
      paymentMethod: 'upi',
      description: '',
    });
    setShowAddModal(false);
    // Refresh payments
    const feePayments = await getFeePayments();
    const paymentsWithStudent = await Promise.all(
      feePayments.map(async (p: any) => {
        let studentName = p.studentName || '';
        if (!studentName && p.studentId) {
          const student = await getStudentByStudentId(p.studentId);
          if (student) {
            studentName = student.fullName || '';
          }
        }
        return {
          id: p.id,
          studentName,
          studentId: p.studentId,
          amount: p.amount,
          paymentDate: p.paymentDate instanceof Date ? p.paymentDate : p.paymentDate?.toDate?.() || new Date(p.paymentDate),
          dueDate: p.dueDate instanceof Date ? p.dueDate : p.dueDate?.toDate?.() || new Date(p.dueDate),
          status: p.status || 'paid',
          paymentMethod: p.paymentMethod || 'upi',
          description: p.description || '',
        };
      })
    );
    setPayments(paymentsWithStudent);
  };

  const handleAddFee = async () => {
    if (!newFee.studentId || !newFee.amount || !newFee.dueDate) {
      alert('Please fill all required fields.');
      return;
    }
    await createStudentFee({
      studentId: newFee.studentId,
      feeStructureId: '', // You can link to a structure if needed
      amount: Number(newFee.amount),
      dueDate: new Date(newFee.dueDate),
      status: 'pending',
      paidAmount: 0,
      remainingAmount: Number(newFee.amount),
      description: newFee.description,
      subject: newFee.subject, // Save subject
    });
    setShowAddFeeModal(false);
    setNewFee({ studentId: '', amount: 0, dueDate: '', description: '', subject: '' });
    // Optionally refresh student fees if a student is selected
    if (newPayment.studentId) {
      const fees = await getStudentFees(newPayment.studentId);
      setStudentFees(fees);
    }
    await fetchAllFees();
    alert('Fee requested successfully!');
  };

  const handleMarkAsPaid = async (feeId: string) => {
    // Find the fee object
    const fee = allStudentFees.find(f => f.id === feeId);
    if (!fee) return;
    // Mark fee as paid in studentFees
    const feeRef = doc(db, 'studentFees', feeId);
    await updateDoc(feeRef, { status: 'paid', updatedAt: new Date() });
    // Create a payment record in feePayments
    const paymentData = {
      studentId: fee.studentId,
      studentFeeId: feeId,
      amount: Number(fee.amount),
      paymentMethod: 'cash', // or let admin choose
      paymentDate: new Date(),
      dueDate: fee.dueDate instanceof Date ? fee.dueDate : fee.dueDate?.toDate?.() || new Date(fee.dueDate),
      description: fee.description || '',
      status: 'paid',
      receiptNumber: `RCPT${Date.now()}`,
      createdBy: 'Admin',
    };
    await createFeePayment(paymentData);
    await fetchAllFees();
    // Refresh payments
    const feePayments = await getFeePayments();
    const paymentsWithStudent = await Promise.all(
      feePayments.map(async (p) => {
        let studentName = p.studentName || '';
        if (!studentName && p.studentId) {
          const student = await getStudentByStudentId(p.studentId);
          if (student) {
            studentName = student.fullName || student.name || '';
          }
        }
        return {
          id: p.id,
          studentName,
          studentId: p.studentId,
          amount: p.amount,
          paymentDate: p.paymentDate instanceof Date ? p.paymentDate : p.paymentDate?.toDate?.() || new Date(p.paymentDate),
          dueDate: p.dueDate instanceof Date ? p.dueDate : p.dueDate?.toDate?.() || new Date(p.dueDate),
          status: p.status || 'paid',
          paymentMethod: p.paymentMethod || 'upi',
          description: p.description || '',
        };
      })
    );
    setPayments(paymentsWithStudent);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>;
      case 'card':
        return <Badge variant="outline">Card</Badge>;
      case 'upi':
        return <Badge variant="outline">UPI</Badge>;
      case 'bank_transfer':
        return <Badge variant="outline">Bank Transfer</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate financial metrics
  const pendingFees = allStudentFees.filter(fee => fee.status === 'pending');
  const pendingAmount = pendingFees.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  // Monthly revenue data (from actual payments)
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthPayments = payments.filter(p => p.paymentDate && p.paymentDate.getMonth() === i && p.status === 'paid');
    const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
    const students = new Set(monthPayments.map(p => p.studentId)).size;
    return { month: monthNames[i], revenue, students };
  });

  // Course revenue data
  const courseData = payments.reduce((acc, payment) => {
    if (payment.status === 'paid') {
      if (!acc[payment.course]) {
        acc[payment.course] = 0;
      }
      acc[payment.course] += payment.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const courseChartData = Object.entries(courseData).map(([course, revenue]) => ({
    course,
    revenue,
  }));

  if (loading) {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
            <p className="text-gray-600">Manage payments, revenue, and financial reports</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button loading={buttonLoading}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                  <DialogDescription>Add a new payment record</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={newPayment.studentName}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, studentName: e.target.value }))}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newPayment.studentId}
                        onChange={e => {
                          setNewPayment({ ...newPayment, studentId: e.target.value });
                          setSelectedStudentFeeId(''); // Reset fee selection when student changes
                        }}
                        placeholder="Enter Student ID"
                        className="w-full"
                      />
                    </div>
                  </div>
                  {/* Student Fee Dropdown */}
                  <div className="mb-4">
                    <Label htmlFor="studentFee">Select Fee</Label>
                    <select
                      id="studentFee"
                      className="w-full border rounded px-3 py-2 mt-1"
                      value={selectedStudentFeeId}
                      onChange={e => setSelectedStudentFeeId(e.target.value)}
                      disabled={studentFees.length === 0}
                    >
                      <option value="">{studentFees.length ? 'Select a fee...' : 'Enter Student ID first'}</option>
                      {studentFees.map(fee => (
                        <option key={fee.id} value={fee.id}>
                          {fee.amount} due {fee.dueDate instanceof Date ? format(fee.dueDate, 'MMM dd, yyyy') : fee.dueDate?.toDate?.() ? format(fee.dueDate.toDate(), 'MMM dd, yyyy') : ''} ({fee.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newPayment.dueDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <select
                      id="course"
                      value={newPayment.course}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Course</option>
                      <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                      <option value="NEET">NEET</option>
                      <option value="Class 11th Science">Class 11th Science</option>
                      <option value="Class 12th Science">Class 12th Science</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <select
                      id="paymentMethod"
                      value={newPayment.paymentMethod}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Payment description"
                    />
                  </div>
                  <Button loading={buttonLoading} onClick={handleAddPayment} className="w-full">
                    Add Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
            {/* Request Payment (Add Fee) Modal */}
            <Dialog open={showAddFeeModal} onOpenChange={setShowAddFeeModal}>
              <DialogTrigger asChild>
                <Button loading={buttonLoading} className="mb-4" onClick={() => setShowAddFeeModal(true)}>
                  Request Payment (Add Fee)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Request Payment (Add Fee)</DialogTitle>
                  <DialogDescription>Create a new fee (bill) for a student.</DialogDescription>
                </DialogHeader>
                <div className="mb-4">
                  <Label htmlFor="feeStudentId">Student ID</Label>
                  <Input
                    id="feeStudentId"
                    value={newFee.studentId}
                    onChange={e => setNewFee({ ...newFee, studentId: e.target.value })}
                    placeholder="Enter Student ID"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="feeAmount">Amount</Label>
                  <Input
                    id="feeAmount"
                    type="number"
                    value={newFee.amount}
                    onChange={e => setNewFee({ ...newFee, amount: e.target.value })}
                    placeholder="Enter Amount"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="feeDueDate">Due Date</Label>
                  <Input
                    id="feeDueDate"
                    type="date"
                    value={newFee.dueDate}
                    onChange={e => setNewFee({ ...newFee, dueDate: e.target.value })}
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="feeDescription">Description</Label>
                  <Input
                    id="feeDescription"
                    value={newFee.description}
                    onChange={e => setNewFee({ ...newFee, description: e.target.value })}
                    placeholder="e.g. January Tuition"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={newFee.subject}
                    onChange={e => setNewFee({ ...newFee, subject: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Subject</option>
                    {studentSubjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>
                <Button loading={buttonLoading} onClick={handleAddFee}>Add Fee</Button>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue (Paid Fees)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Fees ({pendingFees.length})</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {pendingFees.length} fees pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'overdue').length} overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Payment collection rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Course-wise revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments by Course Accordion */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">Individual Payments by Course</h2>
        <div>
          {/* Group payments by course */}
          {Object.keys(courseData).length === 0 ? (
            <p className="text-gray-500">No payments found.</p>
          ) : (
            <Accordion type="multiple" className="w-full">
              {Object.keys(courseData).map((course) => {
                const coursePayments = payments.filter(
                  (p) => p.status === 'paid' && p.course === course
                );
                return (
                  <AccordionItem value={course} key={course}>
                    <AccordionTrigger className="text-lg font-semibold bg-gray-100 px-4 py-2 rounded mb-2">
                      {course} <span className="ml-2 text-sm text-gray-500">({coursePayments.length} payments, ₹{courseData[course].toLocaleString()})</span>
                    </AccordionTrigger>
                    <AccordionContent className="bg-white border rounded-b px-4 py-2 mb-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead>
                            <tr>
                              <th className="px-2 py-1 border">Student Name</th>
                              <th className="px-2 py-1 border">Student ID</th>
                              <th className="px-2 py-1 border">Amount</th>
                              <th className="px-2 py-1 border">Payment Date</th>
                              <th className="px-2 py-1 border">Payment Method</th>
                              <th className="px-2 py-1 border">Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {coursePayments.map((p) => (
                              <tr key={p.id}>
                                <td className="px-2 py-1 border">{p.studentName}</td>
                                <td className="px-2 py-1 border">{p.studentId}</td>
                                <td className="px-2 py-1 border">₹{p.amount.toLocaleString()}</td>
                                <td className="px-2 py-1 border">{format(p.paymentDate, 'MMM dd, yyyy')}</td>
                                <td className="px-2 py-1 border">{p.paymentMethod}</td>
                                <td className="px-2 py-1 border">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </div>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment & Fee Records</CardTitle>
              <CardDescription>Manage student payments and pending fees</CardDescription>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Unified Table: show payments or pending fees based on filter */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-2 py-1 border">Student Name</th>
                    <th className="px-2 py-1 border">Student ID</th>
                    <th className="px-2 py-1 border">Amount</th>
                    <th className="px-2 py-1 border">Due Date</th>
                    <th className="px-2 py-1 border">Status</th>
                    <th className="px-2 py-1 border">Description</th>
                    <th className="px-2 py-1 border">Course</th>
                    {statusFilter === 'all' || statusFilter === 'paid' || statusFilter === 'overdue' ? (
                      <>
                        <th className="px-2 py-1 border">Payment Date</th>
                        <th className="px-2 py-1 border">Payment Method</th>
                      </>
                    ) : null}
                    {statusFilter === 'pending' && <th className="px-2 py-1 border">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {/* Show pending fees if filter is 'pending' */}
                  {statusFilter === 'pending'
                    ? allStudentFees
                        .filter(fee => fee.status === 'pending' && (
                          !searchTerm ||
                          (studentNames[fee.studentId] || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          fee.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (fee.description || '').toLowerCase().includes(searchTerm.toLowerCase())
                        ))
                        .map(fee => (
                          <tr key={fee.id}>
                            <td className="px-2 py-1 border">{studentNames[fee.studentId] || ''}</td>
                            <td className="px-2 py-1 border">{fee.studentId}</td>
                            <td className="px-2 py-1 border">₹{fee.amount}</td>
                            <td className="px-2 py-1 border">{fee.dueDate instanceof Date ? format(fee.dueDate, 'MMM dd, yyyy') : fee.dueDate?.toDate?.() ? format(fee.dueDate.toDate(), 'MMM dd, yyyy') : ''}</td>
                            <td className="px-2 py-1 border">Pending</td>
                            <td className="px-2 py-1 border">{fee.description}</td>
                            <td className="px-2 py-1 border">{fee.course || ''}</td>
                            <td className="px-2 py-1 border">
                              <button
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                                onClick={() => handleMarkAsPaid(fee.id)}
                              >
                                Mark as Paid
                              </button>
                            </td>
                          </tr>
                        ))
                    : filteredPayments
                        .filter(payment =>
                          statusFilter === 'all' || payment.status === statusFilter
                        )
                        .filter(payment =>
                          !searchTerm ||
                          payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.course.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map(payment => (
                          <tr key={payment.id}>
                            <td className="px-2 py-1 border">{payment.studentName}</td>
                            <td className="px-2 py-1 border">{payment.studentId}</td>
                            <td className="px-2 py-1 border">₹{payment.amount.toLocaleString()}</td>
                            <td className="px-2 py-1 border">{format(payment.dueDate, 'MMM dd, yyyy')}</td>
                            <td className="px-2 py-1 border">{getStatusBadge(payment.status)}</td>
                            <td className="px-2 py-1 border">{payment.description}</td>
                            <td className="px-2 py-1 border">{payment.course || ''}</td>
                            <td className="px-2 py-1 border">{format(payment.paymentDate, 'MMM dd, yyyy')}</td>
                            <td className="px-2 py-1 border">{getPaymentMethodBadge(payment.paymentMethod)}</td>
                          </tr>
                        ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}