"use client";

import FeeReceiptGenerator from '@/components/fees/FeeReceiptGenerator';
// import { getFeePaymentById } from '@/firebase/fees'; // Implement this if needed

interface PageProps {
  params: { id: string };
}

export default function StudentReceiptPage({ params }: PageProps) {
  // In a real app, fetch payment by params.id
  // const payment = await getFeePaymentById(params.id);
  // const studentName = ...;
  // For now, mock data:
  const payment = {
    id: params.id,
    studentId: 'demo-student-id',
    receiptNumber: 'R12345',
    amount: 2000,
    paymentMethod: 'cash',
    paymentDate: new Date(),
    transactionId: 'TXN123',
    notes: 'Paid in full',
  };
  const studentName = 'John Doe';

  return (
    <div className="max-w-xl mx-auto py-8">
      <FeeReceiptGenerator payment={payment} studentName={studentName} />
    </div>
  );
} 