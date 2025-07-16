"use client";

import { useState, useEffect } from 'react';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getFeePayments } from '@/firebase/fees';
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment if you have an auth context

export default function StudentPaymentsPage() {
  // const { user } = useAuth();
  const studentId = "demo-student-id"; // Replace with user?.uid from auth context
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (studentId) {
      loadPayments();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadPayments = async () => {
    const data = await getFeePayments(studentId);
    setPayments(data);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Payment History</h1>
      <FeePaymentTable payments={payments} />
    </div>
  );
} 