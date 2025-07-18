"use client";

import { useState, useEffect } from 'react';
import StudentFeeOverview from '@/components/fees/StudentFeeOverview';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getStudentFees, getFeePayments } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentFeesPage() {
  const { userProfile, loading } = useAuth();
  const studentId = userProfile?.studentId;

  const [fees, setFees] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const handlePay = (paymentId: string) => {
    alert(`Initiate payment for fee ID: ${paymentId}`);
    // Here you can open a payment modal or redirect to payment gateway
  };

  const handleManualPaymentSubmit = (paymentId: string, txnId: string, screenshotFile: File | null) => {
    alert(`Manual payment submitted for fee ID: ${paymentId}, txnId: ${txnId}`);
    // Save to Firestore or backend here
  };

  useEffect(() => {
    if (studentId) {
      loadFeeData();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadFeeData = async () => {
    if (!studentId) return;
    const [studentFees, feePayments] = await Promise.all([
      getStudentFees(studentId),
      getFeePayments(studentId)
    ]);
    setFees(studentFees);
    setPayments(feePayments);
  };

  if (loading) return <div>Loading...</div>;
  if (!studentId) return <div>Please log in to view your fees.</div>;

  // Only show pending fees for payment requests
  const pendingFees = fees.filter(fee => fee.status === 'pending');

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">My Payment Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">View and pay your pending fees below.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <FeePaymentTable
          payments={pendingFees.map(fee => ({
            id: fee.id,
            receiptNumber: fee.receiptNumber || '-',
            amount: fee.amount,
            paymentMethod: fee.paymentMethod || '-',
            paymentDate: fee.dueDate,
            notes: fee.description || '-',
            studentFeeId: fee.id,
            status: fee.status,
          }))}
          feeIdToSubjectMap={Object.fromEntries(fees.map(fee => [fee.id, fee.course || fee.subject || '-']))}
          onPay={handlePay}
          onManualPaymentSubmit={handleManualPaymentSubmit}
        />
      </div>
    </div>
  );
} 