import React from 'react';
import { useState, useEffect } from 'react';
import StudentFeeOverview from '@/components/fees/StudentFeeOverview';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getStudentFees, getFeePayments } from '@/firebase/fees';

interface PageProps {
  params: { id: string };
}

export default function StudentFeeManagementPage({ params }: PageProps) {
  const studentId = params.id;
  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    if (studentId) {
      loadData();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadData = async () => {
    const [feesData, paymentsData] = await Promise.all([
      getStudentFees(studentId),
      getFeePayments(studentId)
    ]);
    setFees(feesData);
    setPayments(paymentsData);
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Student Fee Management</h1>
      <div className="text-gray-600 mb-4">Student ID: <span className="font-mono">{studentId}</span></div>
      <StudentFeeOverview fees={fees} />
      <FeePaymentTable payments={payments} />
    </div>
  );
} 