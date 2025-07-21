"use client";

import { useState, useEffect } from 'react';
import StudentFeeOverview from '@/components/fees/StudentFeeOverview';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getStudentFees, getFeePayments } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../store';
import type { RootState } from '../../store';

export default function StudentFeesPage() {
  const { userProfile } = useAuth();
  const { setIsDataLoading } = useDataLoading();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  useEffect(() => {
    setIsDataLoading(studentStatus === 'loading');
  }, [studentStatus, setIsDataLoading]);

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) return <div>Please log in to view your fees.</div>;

  // If student.fees is not available, you may need to fetch it separately or add it to the API
  const fees = student.fees || [];
  const pendingFees = fees.filter((fee: any) => fee.status === 'pending');

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">My Payment Requests</h1>
        <p className="text-gray-600 dark:text-gray-400">View and pay your pending fees below.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <FeePaymentTable
          payments={pendingFees.map((fee: any) => ({
            id: fee.id,
            receiptNumber: fee.receiptNumber || '-',
            amount: fee.amount,
            paymentMethod: fee.paymentMethod || '-',
            paymentDate: fee.dueDate,
            notes: fee.description || '-',
            studentFeeId: fee.id,
            status: fee.status,
          }))}
          feeIdToSubjectMap={Object.fromEntries(fees.map((fee: any) => [fee.id, fee.course || fee.subject || '-']))}
          onPay={(paymentId: string) => alert(`Initiate payment for fee ID: ${paymentId}`)}
          onManualPaymentSubmit={(paymentId: string, txnId: string, screenshotFile: File | null) => alert(`Manual payment submitted for fee ID: ${paymentId}, txnId: ${txnId}`)}
        />
      </div>
    </div>
  );
} 