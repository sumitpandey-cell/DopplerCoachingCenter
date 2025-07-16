"use client";

import { useState, useEffect } from 'react';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getFeePayments } from '@/firebase/fees';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    const data = await getFeePayments();
    setPayments(data);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">All Fee Payments</h1>
      <FeePaymentTable payments={payments} />
    </div>
  );
} 