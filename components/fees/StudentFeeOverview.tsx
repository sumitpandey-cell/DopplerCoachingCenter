"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface StudentFee {
  id: string;
  name: string;
  amount: number;
  dueDate: any; // Date or Timestamp
  status: 'pending' | 'paid' | 'overdue' | 'partially_paid';
  paidAmount: number;
  remainingAmount: number;
  course?: string;
  batch?: string;
  description?: string;
  subject?: string; // Added subject field
}

interface StudentFeeOverviewProps {
  fees: StudentFee[];
}

function getStatusColor(status: string) {
  switch (status) {
    case 'paid': return 'default';
    case 'partially_paid': return 'secondary';
    case 'overdue': return 'destructive';
    default: return 'outline';
  }
}

export default function StudentFeeOverview({ fees }: StudentFeeOverviewProps) {
  // Group fees by subject (or course as fallback)
  const feesBySubject: Record<string, StudentFee[]> = {};
  fees.forEach(fee => {
    const subject = fee.subject || fee.course || 'Other';
    if (!feesBySubject[subject]) feesBySubject[subject] = [];
    feesBySubject[subject].push(fee);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Fees</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {Object.keys(feesBySubject).length === 0 && (
            <div className="text-center text-gray-500 py-8">No fees assigned</div>
          )}
          {Object.entries(feesBySubject).map(([subject, subjectFees]) => (
            <div key={subject}>
              <h3 className="text-lg font-semibold mb-2">{subject}</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr>
                      <th className="px-2 py-1 border">Name</th>
                      <th className="px-2 py-1 border">Batch</th>
                      <th className="px-2 py-1 border">Description</th>
                      <th className="px-2 py-1 border">Due Date</th>
                      <th className="px-2 py-1 border">Status</th>
                      <th className="px-2 py-1 border">Remaining</th>
                      <th className="px-2 py-1 border">Total</th>
                      <th className="px-2 py-1 border">Subject</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjectFees.map(fee => (
                      <tr key={fee.id}>
                        <td className="px-2 py-1 border">{fee.name}</td>
                        <td className="px-2 py-1 border">{fee.batch || '-'}</td>
                        <td className="px-2 py-1 border">{fee.description || '-'}</td>
                        <td className="px-2 py-1 border">{fee.dueDate && (fee.dueDate.toDate ? fee.dueDate.toDate().toLocaleDateString() : new Date(fee.dueDate).toLocaleDateString())}</td>
                        <td className="px-2 py-1 border"><Badge variant={getStatusColor(fee.status)}>{fee.status.replace('_', ' ')}</Badge></td>
                        <td className="px-2 py-1 border">₹{fee.remainingAmount}</td>
                        <td className="px-2 py-1 border">₹{fee.amount}</td>
                        <td className="px-2 py-1 border">{fee.subject || fee.course || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 