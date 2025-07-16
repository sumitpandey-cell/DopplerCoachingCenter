"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFeeStructure } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';

interface FeeStructureFormProps {
  onSuccess?: () => void;
}

export default function FeeStructureForm({ onSuccess }: FeeStructureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    description: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createFeeStructure({
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type as 'monthly' | 'quarterly' | 'yearly' | 'one-time',
        description: formData.description,
        isActive: formData.isActive
      });

      toast({
        title: 'Success',
        description: 'Fee structure created successfully',
      });

      setFormData({
        name: '',
        amount: '',
        type: '',
        description: '',
        isActive: true
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create fee structure',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Fee Structure</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Fee Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Monthly Tuition"
              required
            />
          </div>

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
            <Label htmlFor="type">Fee Type</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select fee type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Fee description..."
            />
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? 'Creating...' : 'Create Fee Structure'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 