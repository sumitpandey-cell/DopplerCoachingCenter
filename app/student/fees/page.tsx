"use client";

import { useState, useEffect } from 'react';
import StudentFeeOverview from '@/components/fees/StudentFeeOverview';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getStudentFees, getFeePayments } from '@/firebase/fees';
// import { useAuth } from '@/contexts/AuthContext'; // Uncomment if you have an auth context

export default function StudentFeesPage() {
  // const { user } = useAuth();
  const studentId = "demo-student-id"; // Replace with user?.uid from auth context
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (studentId) {
      loadFeeData();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadFeeData = async () => {
    const [studentFees, feePayments] = await Promise.all([
      getStudentFees(studentId),
      getFeePayments(studentId)
    ]);
    setFees(studentFees);
    setPayments(feePayments);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">My Fees</h1>
      <StudentFeeOverview fees={fees} />
      <FeePaymentTable payments={payments.slice(0, 5)} />
    </div>
  );
} 