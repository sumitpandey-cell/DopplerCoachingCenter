"use client";

import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ReactToPrint from 'react-to-print';

interface FeePayment {
  id: string;
  studentId: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: any; // Date or Timestamp
  transactionId?: string;
  notes?: string;
}

interface FeeReceiptGeneratorProps {
  payment: FeePayment;
  studentName: string;
}

const ReceiptContent = React.forwardRef<HTMLDivElement, { payment: FeePayment; studentName: string }>(
  ({ payment, studentName }, ref) => (
    <div ref={ref} className="max-w-lg mx-auto p-6 border rounded bg-white text-black">
      <h2 className="text-xl font-bold mb-2 text-center">Doppler Coaching Center</h2>
      <h3 className="text-lg font-semibold mb-4 text-center">Fee Payment Receipt</h3>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">Receipt #:</span>
        <span>{payment.receiptNumber}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">Student Name:</span>
        <span>{studentName}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">Amount Paid:</span>
        <span>₹{payment.amount}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">Payment Method:</span>
        <span>{payment.paymentMethod}</span>
      </div>
      <div className="mb-2 flex justify-between">
        <span className="font-medium">Payment Date:</span>
        <span>{payment.paymentDate && (payment.paymentDate.toDate ? payment.paymentDate.toDate().toLocaleDateString() : new Date(payment.paymentDate).toLocaleDateString())}</span>
      </div>
      {payment.transactionId && (
        <div className="mb-2 flex justify-between">
          <span className="font-medium">Transaction ID:</span>
          <span>{payment.transactionId}</span>
        </div>
      )}
      {payment.notes && (
        <div className="mb-2 flex justify-between">
          <span className="font-medium">Notes:</span>
          <span>{payment.notes}</span>
        </div>
      )}
      <div className="mt-6 text-center text-xs text-gray-500">This is a computer-generated receipt and does not require a signature.</div>
    </div>
  )
);
ReceiptContent.displayName = 'ReceiptContent';

export default function FeeReceiptGenerator({ payment, studentName }: FeeReceiptGeneratorProps) {
  const printRef = useRef<HTMLDivElement>(null);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Fee Receipt</CardTitle>
        <ReactToPrint
          trigger={() => (
            <Button variant="outline" size="sm">Print / Save PDF</Button>
          )}
          content={() => printRef.current}
        />
      </CardHeader>
      <CardContent>
        <div style={{ display: 'none' }}>
          <ReceiptContent ref={printRef} payment={payment} studentName={studentName} />
        </div>
        {/* Show a preview for the user as well */}
        <ReceiptContent payment={payment} studentName={studentName} />
      </CardContent>
    </Card>
  );
} 