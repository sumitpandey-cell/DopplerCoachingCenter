"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFeePayment } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';

interface FeePaymentFormProps {
  studentId: string;
  studentFeeId: string;
  receiptNumber: string;
  onSuccess?: () => void;
}

export default function FeePaymentForm({ studentId, studentFeeId, receiptNumber, onSuccess }: FeePaymentFormProps) {
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: '',
    paymentDate: '',
    transactionId: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createFeePayment({
        studentId,
        studentFeeId,
        amount: parseFloat(formData.amount),
        paymentMethod: formData.paymentMethod as 'cash' | 'card' | 'upi' | 'bank_transfer' | 'cheque',
        paymentDate: new Date(formData.paymentDate),
        transactionId: formData.transactionId || undefined,
        receiptNumber,
        notes: formData.notes || undefined,
        createdBy: 'admin', // Replace with actual user id if available
        status: 'completed',
        studentName: '', // Optionally fetch or pass real name
        feeStructureName: '', // Optionally fetch or pass real name
      });
      toast({
        title: 'Success',
        description: 'Payment recorded successfully',
      });
      setFormData({
        amount: '',
        paymentMethod: '',
        paymentDate: '',
        transactionId: '',
        notes: '',
      });
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to record payment',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record Fee Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div>
            <Label htmlFor="paymentMethod">Payment Method</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => setFormData(prev => ({ ...prev, paymentMethod: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="upi">UPI</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="cheque">Cheque</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paymentDate">Payment Date</Label>
            <Input
              id="paymentDate"
              type="date"
              value={formData.paymentDate}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentDate: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="transactionId">Transaction ID (optional)</Label>
            <Input
              id="transactionId"
              value={formData.transactionId}
              onChange={(e) => setFormData(prev => ({ ...prev, transactionId: e.target.value }))}
              placeholder="Transaction/reference number"
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes..."
            />
          </div>
          <Button type="submit" disabled={loading}>
            {loading ? 'Recording...' : 'Record Payment'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 