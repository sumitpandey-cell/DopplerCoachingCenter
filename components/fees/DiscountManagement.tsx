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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { createDiscount, getDiscounts, getFeeStructures, FeeDiscount, FeeStructure } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, Percent, IndianRupee, Calendar, Users, Gift } from 'lucide-react';
import { format } from 'date-fns';

export default function DiscountManagement() {
  const [discounts, setDiscounts] = useState<FeeDiscount[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    eligibilityCriteria: '',
    maxUsage: '',
    validFrom: '',
    validTo: '',
    applicableFor: [] as string[],
    isActive: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [discountsData, feeStructuresData] = await Promise.all([
        getDiscounts(),
        getFeeStructures()
      ]);
      setDiscounts(discountsData as FeeDiscount[]);
      setFeeStructures(feeStructuresData as FeeStructure[]);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch discount data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createDiscount({
        name: formData.name,
        type: formData.type,
        value: parseFloat(formData.value),
        description: formData.description,
        eligibilityCriteria: formData.eligibilityCriteria,
        maxUsage: formData.maxUsage ? parseInt(formData.maxUsage) : undefined,
        validFrom: new Date(formData.validFrom),
        validTo: formData.validTo ? new Date(formData.validTo) : undefined,
        applicableFor: formData.applicableFor,
        isActive: formData.isActive,
        createdBy: 'admin' // Should come from auth context
      });

      toast({
        title: 'Success',
        description: 'Discount created successfully!',
      });

      // Reset form
      setFormData({
        name: '',
        type: 'percentage',
        value: '',
        description: '',
        eligibilityCriteria: '',
        maxUsage: '',
        validFrom: '',
        validTo: '',
        applicableFor: [],
        isActive: true
      });

      setIsDialogOpen(false);
      fetchData();
    } catch (error) {
      console.error('Error creating discount:', error);
      toast({
        title: 'Error',
        description: 'Failed to create discount',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleFeeStructure = (feeStructureId: string) => {
    setFormData(prev => ({
      ...prev,
      applicableFor: prev.applicableFor.includes(feeStructureId)
        ? prev.applicableFor.filter(id => id !== feeStructureId)
        : [...prev.applicableFor, feeStructureId]
    }));
  };

  const getDiscountStatusBadge = (discount: FeeDiscount) => {
    const now = new Date();
    const validFrom = discount.validFrom instanceof Date ? discount.validFrom : discount.validFrom.toDate();
    const validTo = discount.validTo ? (discount.validTo instanceof Date ? discount.validTo : discount.validTo.toDate()) : null;

    if (!discount.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (now < validFrom) {
      return <Badge variant="outline">Scheduled</Badge>;
    }
    if (validTo && now > validTo) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    if (discount.maxUsage && discount.currentUsage >= discount.maxUsage) {
      return <Badge variant="destructive">Limit Reached</Badge>;
    }
    return <Badge variant="default">Active</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Discount Management</h2>
          <p className="text-gray-600">Create and manage fee discounts and scholarships</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Discount
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Create New Discount
              </DialogTitle>
              <DialogDescription>
                Set up a new discount or scholarship for students
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Discount Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Early Bird Discount"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Discount Type *</Label>
                  <Select value={formData.type} onValueChange={(value: 'percentage' | 'fixed') => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="fixed">Fixed Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="value">
                    {formData.type === 'percentage' ? 'Percentage (%)' : 'Amount (₹)'} *
                  </Label>
                  <div className="relative">
                    {formData.type === 'percentage' ? (
                      <Percent className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    ) : (
                      <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    )}
                    <Input
                      id="value"
                      type="number"
                      step="0.01"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      placeholder={formData.type === 'percentage' ? '10' : '500'}
                      className={formData.type === 'percentage' ? 'pr-10' : 'pl-10'}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="maxUsage">Max Usage (Optional)</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="maxUsage"
                      type="number"
                      value={formData.maxUsage}
                      onChange={(e) => setFormData({ ...formData, maxUsage: e.target.value })}
                      placeholder="100"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              {/* Validity Period */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="validFrom"
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="validTo">Valid To (Optional)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="validTo"
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the discount"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="eligibilityCriteria">Eligibility Criteria</Label>
                <Textarea
                  id="eligibilityCriteria"
                  value={formData.eligibilityCriteria}
                  onChange={(e) => setFormData({ ...formData, eligibilityCriteria: e.target.value })}
                  placeholder="Who is eligible for this discount?"
                  rows={2}
                />
              </div>

              {/* Applicable Fee Structures */}
              <div>
                <Label>Applicable Fee Structures</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border rounded-md p-3">
                  {feeStructures.map((feeStructure) => (
                    <div key={feeStructure.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`fee-${feeStructure.id}`}
                        checked={formData.applicableFor.includes(feeStructure.id)}
                        onChange={() => toggleFeeStructure(feeStructure.id)}
                        className="rounded"
                      />
                      <Label htmlFor={`fee-${feeStructure.id}`} className="text-sm">
                        {feeStructure.name} (₹{feeStructure.amount.toLocaleString()})
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Creating...' : 'Create Discount'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Discounts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Discounts</CardTitle>
          <CardDescription>Manage all discount schemes and scholarships</CardDescription>
        </CardHeader>
        <CardContent>
          {discounts.length === 0 ? (
            <div className="text-center py-8">
              <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No discounts created yet</p>
              <p className="text-sm text-gray-400">Create your first discount to get started</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {discounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{discount.name}</div>
                        <div className="text-sm text-gray-500">{discount.description}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {discount.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {discount.type === 'percentage' 
                        ? `${discount.value}%` 
                        : `₹${discount.value.toLocaleString()}`
                      }
                    </TableCell>
                    <TableCell>
                      {discount.maxUsage 
                        ? `${discount.currentUsage}/${discount.maxUsage}`
                        : `${discount.currentUsage}/∞`
                      }
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>From: {format(discount.validFrom instanceof Date ? discount.validFrom : discount.validFrom.toDate(), 'MMM dd, yyyy')}</div>
                        {discount.validTo && (
                          <div>To: {format(discount.validTo instanceof Date ? discount.validTo : discount.validTo.toDate(), 'MMM dd, yyyy')}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getDiscountStatusBadge(discount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}