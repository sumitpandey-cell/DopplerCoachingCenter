"use client";

import { useState, useEffect } from 'react';
import FeePaymentTable from '@/components/fees/FeePaymentTable';
import { getFeePayments } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentPaymentsPage() {
  const { userProfile, loading } = useAuth();
  const studentId = userProfile?.studentId;
  const [payments, setPayments] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');

  useEffect(() => {
    if (studentId) {
      loadPayments();
    }
    // eslint-disable-next-line
  }, [studentId]);

  const loadPayments = async () => {
    if (!studentId) return;
    const data = await getFeePayments(studentId);
    setPayments(data);
  };

  if (loading) return <div>Loading...</div>;
  if (!studentId) return <div>Please log in to view your payment history.</div>;

  // Only show paid payments
  const paidPayments = payments.filter(p => p.status === 'paid');
  // Get unique subjects
  const subjects = Array.from(new Set(paidPayments.map(p => p.subject).filter(Boolean)));
  // Filter by search and subject
  const filteredPayments = paidPayments.filter(p =>
    (subjectFilter === 'all' || p.subject === subjectFilter) &&
    ((p.receiptNumber || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.notes || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.subject || '').toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-green-700 dark:text-green-300 mb-2 tracking-tight">Payment History</h1>
        <p className="text-gray-600 dark:text-gray-400">View all your completed payments below.</p>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <input
            type="text"
            placeholder="Search by receipt, subject, or notes..."
            className="border px-2 py-1 rounded text-sm flex-1"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
        <FeePaymentTable
          payments={filteredPayments}
          feeIdToSubjectMap={Object.fromEntries(filteredPayments.map(p => [p.studentFeeId, p.subject || '-']))}
        />
      </div>
    </div>
  );
} 