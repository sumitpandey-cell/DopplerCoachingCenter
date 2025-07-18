'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { createFeeStructure, updateFeeStructure, FeeStructure } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';
import { X, Plus, Calculator, Percent, IndianRupee } from 'lucide-react';

interface EnhancedFeeStructureFormProps {
  editingFee?: FeeStructure | null;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function EnhancedFeeStructureForm({ editingFee, onSuccess, onCancel }: EnhancedFeeStructureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: '',
    category: '',
    description: '',
    isActive: true,
    applicableFor: [] as string[],
    dueDay: '',
    lateFeeAmount: '',
    lateFeeGracePeriod: '',
    discountEligible: false,
    taxable: false,
    taxRate: '',
    createdBy: 'admin' // This should come from auth context
  });
  const [loading, setLoading] = useState(false);
  const [newCourse, setNewCourse] = useState('');
  const { toast } = useToast();

  // Populate form when editing
  useEffect(() => {
    if (editingFee) {
      setFormData({
        name: editingFee.name,
        amount: editingFee.amount.toString(),
        type: editingFee.type,
        category: editingFee.category,
        description: editingFee.description,
        isActive: editingFee.isActive,
        applicableFor: editingFee.applicableFor || [],
        dueDay: editingFee.dueDay?.toString() || '',
        lateFeeAmount: editingFee.lateFeeAmount?.toString() || '',
        lateFeeGracePeriod: editingFee.lateFeeGracePeriod?.toString() || '',
        discountEligible: editingFee.discountEligible,
        taxable: editingFee.taxable,
        taxRate: editingFee.taxRate?.toString() || '',
        createdBy: editingFee.createdBy
      });
    }
  }, [editingFee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const feeData = {
        name: formData.name,
        amount: parseFloat(formData.amount),
        type: formData.type as FeeStructure['type'],
        category: formData.category as FeeStructure['category'],
        description: formData.description,
        isActive: formData.isActive,
        applicableFor: formData.applicableFor,
        dueDay: formData.dueDay ? parseInt(formData.dueDay) : undefined,
        lateFeeAmount: formData.lateFeeAmount ? parseFloat(formData.lateFeeAmount) : undefined,
        lateFeeGracePeriod: formData.lateFeeGracePeriod ? parseInt(formData.lateFeeGracePeriod) : undefined,
        discountEligible: formData.discountEligible,
        taxable: formData.taxable,
        taxRate: formData.taxRate ? parseFloat(formData.taxRate) : undefined,
        createdBy: formData.createdBy
      };

      if (editingFee) {
        await updateFeeStructure(editingFee.id, feeData);
        toast({
          title: 'Success',
          description: 'Fee structure updated successfully!',
        });
      } else {
        await createFeeStructure(feeData);
        toast({
          title: 'Success',
          description: 'Fee structure created successfully!',
        });
      }

      // Reset form if not editing
      if (!editingFee) {
        setFormData({
          name: '',
          amount: '',
          type: '',
          category: '',
          description: '',
          isActive: true,
          applicableFor: [],
          dueDay: '',
          lateFeeAmount: '',
          lateFeeGracePeriod: '',
          discountEligible: false,
          taxable: false,
          taxRate: '',
          createdBy: 'admin'
        });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Error saving fee structure:', error);
      toast({
        title: 'Error',
        description: `Failed to ${editingFee ? 'update' : 'create'} fee structure`,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const addCourse = () => {
    if (newCourse.trim() && !formData.applicableFor.includes(newCourse.trim())) {
      setFormData({
        ...formData,
        applicableFor: [...formData.applicableFor, newCourse.trim()]
      });
      setNewCourse('');
    }
  };

  const removeCourse = (course: string) => {
    setFormData({
      ...formData,
      applicableFor: formData.applicableFor.filter(c => c !== course)
    });
  };

  const calculateFinalAmount = () => {
    let amount = parseFloat(formData.amount) || 0;
    if (formData.taxable && formData.taxRate) {
      const tax = (amount * parseFloat(formData.taxRate)) / 100;
      amount += tax;
    }
    return amount;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          {editingFee ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </CardTitle>
        <CardDescription>
          {editingFee ? 'Update the fee structure details' : 'Define a new fee structure for students'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Fee Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Monthly Tuition Fee"
                required
              />
            </div>

            <div>
              <Label htmlFor="amount">Base Amount (₹) *</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5000"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">Fee Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fee type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="admission">Admission</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                  <SelectItem value="lab">Lab</SelectItem>
                  <SelectItem value="library">Library</SelectItem>
                  <SelectItem value="transport">Transport</SelectItem>
                  <SelectItem value="hostel">Hostel</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tuition">Tuition</SelectItem>
                  <SelectItem value="non-tuition">Non-Tuition</SelectItem>
                  <SelectItem value="miscellaneous">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Applicable Courses */}
          <div>
            <Label>Applicable For (Courses/Batches)</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newCourse}
                onChange={(e) => setNewCourse(e.target.value)}
                placeholder="Enter course name"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCourse())}
              />
              <Button type="button" onClick={addCourse} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.applicableFor.map((course) => (
                <Badge key={course} variant="secondary" className="flex items-center gap-1">
                  {course}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeCourse(course)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(formData.type === 'monthly' || formData.type === 'quarterly') && (
                <div>
                  <Label htmlFor="dueDay">Due Day of Month</Label>
                  <Input
                    id="dueDay"
                    type="number"
                    min="1"
                    max="31"
                    value={formData.dueDay}
                    onChange={(e) => setFormData({ ...formData, dueDay: e.target.value })}
                    placeholder="15"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="lateFeeAmount">Late Fee Amount (₹)</Label>
                <Input
                  id="lateFeeAmount"
                  type="number"
                  value={formData.lateFeeAmount}
                  onChange={(e) => setFormData({ ...formData, lateFeeAmount: e.target.value })}
                  placeholder="100"
                />
              </div>

              <div>
                <Label htmlFor="lateFeeGracePeriod">Grace Period (Days)</Label>
                <Input
                  id="lateFeeGracePeriod"
                  type="number"
                  value={formData.lateFeeGracePeriod}
                  onChange={(e) => setFormData({ ...formData, lateFeeGracePeriod: e.target.value })}
                  placeholder="7"
                />
              </div>
            </div>

            {/* Tax Settings */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  id="taxable"
                  checked={formData.taxable}
                  onCheckedChange={(checked) => setFormData({ ...formData, taxable: checked })}
                />
                <Label htmlFor="taxable">Taxable</Label>
              </div>

              {formData.taxable && (
                <div className="w-full md:w-1/3">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <div className="relative">
                    <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={formData.taxRate}
                      onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                      placeholder="18.00"
                      className="pr-10"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Other Settings */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="discountEligible"
                  checked={formData.discountEligible}
                  onCheckedChange={(checked) => setFormData({ ...formData, discountEligible: checked })}
                />
                <Label htmlFor="discountEligible">Discount Eligible</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </div>
          </div>

          {/* Amount Preview */}
          {formData.amount && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Amount Preview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Base Amount:</span>
                  <span>₹{parseFloat(formData.amount || '0').toLocaleString()}</span>
                </div>
                {formData.taxable && formData.taxRate && (
                  <div className="flex justify-between text-blue-700">
                    <span>Tax ({formData.taxRate}%):</span>
                    <span>₹{((parseFloat(formData.amount || '0') * parseFloat(formData.taxRate)) / 100).toLocaleString()}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold text-blue-900">
                  <span>Final Amount:</span>
                  <span>₹{calculateFinalAmount().toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the fee structure"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : (editingFee ? 'Update Fee Structure' : 'Create Fee Structure')}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}