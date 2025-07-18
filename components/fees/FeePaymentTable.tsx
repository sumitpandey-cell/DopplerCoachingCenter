"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import React, { useState } from 'react';
import Image from 'next/image';

interface FeePayment {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: any; // Date or Timestamp
  notes?: string;
  studentFeeId: string; // Added studentFeeId
  status: 'pending' | 'paid'; // Added status
}

interface FeePaymentTableProps {
  payments: FeePayment[];
  feeIdToSubjectMap: Record<string, string>; // Map studentFeeId to subject
  onPay?: (paymentId: string) => void; // Add onPay callback
  onManualPaymentSubmit?: (paymentId: string, txnId: string, screenshotFile: File | null) => void; // Add onManualPaymentSubmit callback
}

export default function FeePaymentTable({ payments, feeIdToSubjectMap = {}, onPay, onManualPaymentSubmit }: FeePaymentTableProps) {
  const [showModal, setShowModal] = useState<string | null>(null);
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);

  const handleOpenModal = (paymentId: string) => {
    setShowModal(paymentId);
    setTxnId('');
    setScreenshot(null);
  };

  const handleSubmit = (paymentId: string) => {
    if (onManualPaymentSubmit) {
      onManualPaymentSubmit(paymentId, txnId, screenshot);
    }
    setShowModal(null);
  };

  return (
    <Card>
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-base">Fee Payments</CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4">
        <div className="overflow-x-auto">
          <Table className="text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">No payments found</TableCell>
                </TableRow>
              )}
              {payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.receiptNumber}</TableCell>
                  <TableCell className="font-semibold">₹{payment.amount}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{payment.paymentMethod}</Badge>
                  </TableCell>
                  <TableCell>
                    {payment.paymentDate &&
                      (payment.paymentDate.toDate
                        ? payment.paymentDate.toDate().toLocaleDateString()
                        : new Date(payment.paymentDate).toLocaleDateString())}
                  </TableCell>
                  <TableCell>{feeIdToSubjectMap?.[payment.studentFeeId] || '-'}</TableCell>
                  <TableCell>{payment.notes || '-'}</TableCell>
                  <TableCell>
                    {payment.status === 'pending' ? (
                      <button
                        className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                        onClick={() => handleOpenModal(payment.id)}
                      >
                        Pay
                      </button>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {/* Manual Payment Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded shadow-lg p-6 w-full max-w-sm">
              <h2 className="text-lg font-semibold mb-2">Manual UPI Payment</h2>
              <div className="flex flex-col items-center mb-2">
                <Image src="/static/upi-qr.png" alt="UPI QR Code" width={128} height={128} className="w-32 h-32 mb-2 border" />
                <p className="mb-2">Scan this QR code or use the UPI ID below:</p>
                <p className="mb-2">Send payment to UPI ID: <span className="font-mono font-bold">yourupi@bank</span></p>
              </div>
              <div className="mb-2">
                <label className="block text-xs mb-1">Transaction ID</label>
                <input
                  type="text"
                  className="w-full border px-2 py-1 rounded text-xs"
                  value={txnId}
                  onChange={e => setTxnId(e.target.value)}
                  placeholder="Enter UPI transaction ID"
                />
              </div>
              <div className="mb-2">
                <label className="block text-xs mb-1">Upload Screenshot (optional)</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-xs"
                  onChange={e => setScreenshot(e.target.files?.[0] || null)}
                />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button className="px-3 py-1 text-xs rounded bg-gray-200" onClick={() => setShowModal(null)}>Cancel</button>
                <button
                  className="px-3 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                  onClick={() => handleSubmit(showModal)}
                  disabled={!txnId}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}