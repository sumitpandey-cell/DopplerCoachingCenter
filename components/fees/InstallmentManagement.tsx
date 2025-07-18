'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createInstallmentPlan } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar, IndianRupee, Trash2, Calculator, Clock, CheckCircle } from 'lucide-react';
import { format, addMonths, addDays } from 'date-fns';

interface Installment {
  amount: number;
  dueDate: Date;
  description?: string;
}

interface InstallmentPlanProps {
  studentFeeId: string;
  totalAmount: number;
  studentName: string;
  feeName: string;
  onSuccess?: () => void;
}

export default function InstallmentManagement({ 
  studentFeeId, 
  totalAmount, 
  studentName, 
  feeName,
  onSuccess 
}: InstallmentPlanProps) {
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [planType, setPlanType] = useState<'custom' | 'monthly' | 'weekly'>('monthly');
  const [numberOfInstallments, setNumberOfInstallments] = useState(3);
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const { toast } = useToast();

  const generateInstallmentPlan = () => {
    const start = new Date(startDate);
    const amountPerInstallment = Math.floor(totalAmount / numberOfInstallments);
    const remainder = totalAmount - (amountPerInstallment * numberOfInstallments);
    
    const newInstallments: Installment[] = [];
    
    for (let i = 0; i < numberOfInstallments; i++) {
      let dueDate: Date;
      
      switch (planType) {
        case 'monthly':
          dueDate = addMonths(start, i);
          break;
        case 'weekly':
          dueDate = addDays(start, i * 7);
          break;
        default:
          dueDate = addDays(start, i * 30); // Default to 30 days
      }
      
      // Add remainder to the last installment
      const amount = i === numberOfInstallments - 1 
        ? amountPerInstallment + remainder 
        : amountPerInstallment;
      
      newInstallments.push({
        amount,
        dueDate,
        description: `Installment ${i + 1} of ${numberOfInstallments}`
      });
    }
    
    setInstallments(newInstallments);
  };

  const addCustomInstallment = () => {
    const remainingAmount = totalAmount - installments.reduce((sum, inst) => sum + inst.amount, 0);
    if (remainingAmount <= 0) {
      toast({
        title: 'Error',
        description: 'Total installment amount cannot exceed the fee amount',
        variant: 'destructive',
      });
      return;
    }

    setInstallments([
      ...installments,
      {
        amount: Math.min(remainingAmount, 1000),
        dueDate: new Date(),
        description: `Installment ${installments.length + 1}`
      }
    ]);
  };

  const updateInstallment = (index: number, field: keyof Installment, value: any) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const removeInstallment = (index: number) => {
    setInstallments(installments.filter((_, i) => i !== index));
  };

  const handleCreatePlan = async () => {
    if (installments.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one installment',
        variant: 'destructive',
      });
      return;
    }

    const totalInstallmentAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
    if (totalInstallmentAmount !== totalAmount) {
      toast({
        title: 'Error',
        description: `Total installment amount (₹${totalInstallmentAmount.toLocaleString()}) must equal fee amount (₹${totalAmount.toLocaleString()})`,
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await createInstallmentPlan(
        studentFeeId,
        installments.map(inst => ({
          amount: inst.amount,
          dueDate: inst.dueDate
        })),
        'admin' // Should come from auth context
      );

      toast({
        title: 'Success',
        description: 'Installment plan created successfully!',
      });

      setIsDialogOpen(false);
      setInstallments([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating installment plan:', error);
      toast({
        title: 'Error',
        description: 'Failed to create installment plan',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const totalInstallmentAmount = installments.reduce((sum, inst) => sum + inst.amount, 0);
  const remainingAmount = totalAmount - totalInstallmentAmount;

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Create Installment Plan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Create Installment Plan
          </DialogTitle>
          <DialogDescription>
            Set up a payment plan for {studentName} - {feeName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Fee Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Fee Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-600">Student</Label>
                  <p className="font-medium">{studentName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Fee</Label>
                  <p className="font-medium">{feeName}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Total Amount</Label>
                  <p className="font-medium text-lg">₹{totalAmount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-600">Remaining to Allocate</Label>
                  <p className={`font-medium text-lg ${remainingAmount === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    ₹{remainingAmount.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plan Generation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Generate Plan</CardTitle>
              <CardDescription>Automatically create an installment plan</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="planType">Plan Type</Label>
                  <select
                    id="planType"
                    value={planType}
                    onChange={(e) => setPlanType(e.target.value as any)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="numberOfInstallments">Number of Installments</Label>
                  <Input
                    id="numberOfInstallments"
                    type="number"
                    min="2"
                    max="12"
                    value={numberOfInstallments}
                    onChange={(e) => setNumberOfInstallments(parseInt(e.target.value) || 2)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={generateInstallmentPlan} className="w-full">
                    Generate Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Installments Table */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-lg">Installment Schedule</CardTitle>
                  <CardDescription>Configure individual installments</CardDescription>
                </div>
                <Button onClick={addCustomInstallment} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Installment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {installments.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No installments added yet</p>
                  <p className="text-sm text-gray-400">Generate a plan or add installments manually</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Installment</TableHead>
                        <TableHead>Amount (₹)</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {installments.map((installment, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant="outline">#{index + 1}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="relative">
                              <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                              <Input
                                type="number"
                                value={installment.amount}
                                onChange={(e) => updateInstallment(index, 'amount', parseFloat(e.target.value) || 0)}
                                className="pl-10"
                                min="1"
                                max={totalAmount}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="date"
                              value={format(installment.dueDate, 'yyyy-MM-dd')}
                              onChange={(e) => updateInstallment(index, 'dueDate', new Date(e.target.value))}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={installment.description || ''}
                              onChange={(e) => updateInstallment(index, 'description', e.target.value)}
                              placeholder="Optional description"
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => removeInstallment(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Summary */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-sm text-gray-600">Total Installments</div>
                        <div className="text-lg font-semibold">{installments.length}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Total Amount</div>
                        <div className="text-lg font-semibold">₹{totalInstallmentAmount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Status</div>
                        <div className="flex items-center justify-center gap-2">
                          {remainingAmount === 0 ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-semibold">Complete</span>
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 text-orange-600" />
                              <span className="text-orange-600 font-semibold">
                                ₹{remainingAmount.toLocaleString()} remaining
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleCreatePlan} 
              disabled={loading || installments.length === 0 || remainingAmount !== 0}
              className="flex-1"
            >
              {loading ? 'Creating...' : 'Create Installment Plan'}
            </Button>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}