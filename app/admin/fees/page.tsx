"use client";

import { useState, useEffect } from 'react';
import FeeStatistics from '@/components/fees/FeeStatistics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getFeeStructures, getFeePayments } from '@/firebase/fees';
import Link from 'next/link';

export default function AdminFeesPage() {
  const [feeStructures, setFeeStructures] = useState<any[]>([]);
  const [recentPayments, setRecentPayments] = useState<any[]>([]);
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
      const totalRevenue = payments.reduce((sum: number, payment: any) => sum + payment.amount, 0);
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
      <FeeStatistics stats={stats} />
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
                    {payment.paymentDate && (payment.paymentDate.toDate ? payment.paymentDate.toDate().toLocaleDateString() : new Date(payment.paymentDate).toLocaleDateString())}
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