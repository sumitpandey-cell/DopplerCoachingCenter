"use client";

import { useState, useEffect } from 'react';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getFeePayments } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../../store';
import type { RootState } from '../../../store';

export default function StudentPaymentsPage() {
  const { userProfile } = useAuth();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  if (studentStatus === 'loading') return <div>Loading...</div>;
  if (!userProfile?.studentId || !student) return <div>Please log in to view your payment history.</div>;

  // Use student.fees for payments
  const paidPayments = (student.fees || []).filter((p: any) => p.status === 'paid');
  // Get unique subjects
  const subjects = Array.from(new Set(paidPayments.map((p: any) => p.subject).filter(Boolean)));
  // Filter by search and subject
  const filteredPayments = paidPayments.filter((p: any) =>
    (subjectFilter === 'all' || p.subject === subjectFilter) &&
    ((p.receiptNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.subject || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">My Payment History</h1>
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search payments..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        />
        <select
          value={subjectFilter}
          onChange={e => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Subjects</option>
          {subjects.map((subject: string) => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>
      <FeePaymentTable
        payments={filteredPayments.map((p: any) => ({
          id: p.id,
          receiptNumber: p.receiptNumber || '-',
          amount: p.amount,
          paymentMethod: p.paymentMethod || '-',
          paymentDate: p.paymentDate || p.dueDate,
          notes: p.description || '-',
          studentFeeId: p.id,
          status: p.status,
        }))}
        feeIdToSubjectMap={Object.fromEntries(filteredPayments.map((p: any) => [p.id, p.course || p.subject || '-']))}
        onPay={() => {}}
        onManualPaymentSubmit={() => {}}
      />
    </div>
  );
} 