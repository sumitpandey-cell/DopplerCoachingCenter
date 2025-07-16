"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface FeePayment {
  id: string;
  receiptNumber: string;
  amount: number;
  paymentMethod: string;
  paymentDate: any; // Date or Timestamp
  notes?: string;
}

interface FeePaymentTableProps {
  payments: FeePayment[];
}

export default function FeePaymentTable({ payments }: FeePaymentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receipt #</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">No payments found</TableCell>
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
                  <TableCell>{payment.notes || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
} 