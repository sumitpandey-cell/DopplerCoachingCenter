'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { subscribeToStudentFees, subscribeToFeePayments, processPayment, StudentFee, FeePayment } from '@/firebase/fees';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Download, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  IndianRupee,
  Receipt,
  History,
  Wallet,
  TrendingUp,
  FileText,
  Phone,
  Mail
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function EnhancedStudentFeeDashboard() {
  const [fees, setFees] = useState<StudentFee[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<StudentFee | null>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'upi',
    transactionId: '',
    notes: ''
  });
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!userProfile?.studentId) return;

    const unsubscribeFees = subscribeToStudentFees(userProfile.studentId, (feesData) => {
      setFees(feesData);
      setLoading(false);
    });

    const unsubscribePayments = subscribeToFeePayments(userProfile.studentId, (paymentsData) => {
      setPayments(paymentsData);
    });

    return () => {
      unsubscribeFees();
      unsubscribePayments();
    };
  }, [userProfile]);

  const handlePayment = async () => {
    if (!selectedFee || !userProfile) return;

    try {
      const paymentAmount = parseFloat(paymentData.amount);
      if (paymentAmount <= 0 || paymentAmount > selectedFee.remainingAmount) {
        toast({
          title: 'Error',
          description: 'Invalid payment amount',
          variant: 'destructive',
        });
        return;
      }

      await processPayment({
        studentId: userProfile.studentId!,
        studentName: userProfile.name,
        studentFeeId: selectedFee.id!,
        feeStructureName: selectedFee.feeStructureName,
        amount: paymentAmount,
        paymentMethod: paymentData.paymentMethod as any,
        paymentDate: new Date(),
        transactionId: paymentData.transactionId,
        notes: paymentData.notes,
        status: 'completed',
        createdBy: userProfile.uid
      });

      toast({
        title: 'Success',
        description: 'Payment processed successfully!',
      });

      setPaymentDialogOpen(false);
      setPaymentData({ amount: '', paymentMethod: 'upi', transactionId: '', notes: '' });
      setSelectedFee(null);
    } catch (error) {
      console.error('Payment error:', error);
      toast({
        title: 'Error',
        description: 'Failed to process payment',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (fee: StudentFee) => {
    const dueDate = fee.dueDate instanceof Date ? fee.dueDate : fee.dueDate.toDate();
    const daysUntilDue = differenceInDays(dueDate, new Date());
    
    switch (fee.status) {
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partially_paid':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      case 'overdue':
        return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
      case 'pending':
        if (daysUntilDue < 0) {
          return <Badge className="bg-red-100 text-red-800">Overdue</Badge>;
        } else if (daysUntilDue <= 7) {
          return <Badge className="bg-orange-100 text-orange-800">Due Soon</Badge>;
        }
        return <Badge className="bg-blue-100 text-blue-800">Pending</Badge>;
      default:
        return <Badge variant="secondary">{fee.status}</Badge>;
    }
  };

  const getDaysUntilDue = (dueDate: Date | any) => {
    const due = dueDate instanceof Date ? dueDate : dueDate.toDate();
    return differenceInDays(due, new Date());
  };

  // Calculate summary statistics
  const totalDue = fees.reduce((sum, fee) => sum + fee.remainingAmount, 0);
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const overdueFees = fees.filter(fee => {
    const daysUntilDue = getDaysUntilDue(fee.dueDate);
    return daysUntilDue < 0 && fee.status !== 'paid';
  });
  const upcomingFees = fees.filter(fee => {
    const daysUntilDue = getDaysUntilDue(fee.dueDate);
    return daysUntilDue >= 0 && daysUntilDue <= 30 && fee.status !== 'paid';
  });

  // Prepare chart data
  const monthlyPayments = payments.reduce((acc, payment) => {
    const date = payment.paymentDate instanceof Date ? payment.paymentDate : payment.paymentDate.toDate();
    const monthKey = format(date, 'MMM yyyy');
    acc[monthKey] = (acc[monthKey] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(monthlyPayments).map(([month, amount]) => ({
    month,
    amount,
    formattedAmount: `₹${amount.toLocaleString()}`
  }));

  const paymentMethodData = payments.reduce((acc, payment) => {
    const method = payment.paymentMethod.replace('_', ' ').toUpperCase();
    acc[method] = (acc[method] || 0) + payment.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(paymentMethodData).map(([method, amount]) => ({
    name: method,
    value: amount,
    formattedValue: `₹${amount.toLocaleString()}`
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

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
          <h2 className="text-2xl font-bold">Fee Dashboard</h2>
          <p className="text-gray-600">Manage your fee payments and view payment history</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Statement
          </Button>
          <Button variant="outline">
            <Receipt className="h-4 w-4 mr-2" />
            All Receipts
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Due</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ₹{totalDue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {fees.filter(f => f.status !== 'paid').length} pending fees
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Paid</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ₹{totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} payments made
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overdueFees.length}
            </div>
            <p className="text-xs text-muted-foreground">
              ₹{overdueFees.reduce((sum, fee) => sum + fee.remainingAmount, 0).toLocaleString()} amount
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {upcomingFees.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Due in next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fee List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Your Fees</CardTitle>
              <CardDescription>All your fee obligations and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {fees.length === 0 ? (
                <div className="text-center py-8">
                  <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No fees assigned yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fee Details</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{fee.feeStructureName}</div>
                            {fee.discountAmount && fee.discountAmount > 0 && (
                              <div className="text-sm text-green-600">
                                Discount: ₹{fee.discountAmount.toLocaleString()}
                              </div>
                            )}
                            {fee.notes && (
                              <div className="text-sm text-gray-500">{fee.notes}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">₹{fee.remainingAmount.toLocaleString()}</div>
                            {fee.paidAmount > 0 && (
                              <div className="text-sm text-gray-500">
                                Paid: ₹{fee.paidAmount.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{format(fee.dueDate instanceof Date ? fee.dueDate : fee.dueDate.toDate(), 'MMM dd, yyyy')}</div>
                            {getDaysUntilDue(fee.dueDate) < 0 && (
                              <div className="text-sm text-red-500">
                                {Math.abs(getDaysUntilDue(fee.dueDate))} days overdue
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(fee)}
                        </TableCell>
                        <TableCell>
                          {fee.status !== 'paid' && (
                            <Dialog open={paymentDialogOpen && selectedFee?.id === fee.id} onOpenChange={(open) => {
                              setPaymentDialogOpen(open);
                              if (!open) setSelectedFee(null);
                            }}>
                              <DialogTrigger asChild>
                                <Button 
                                  size="sm" 
                                  onClick={() => {
                                    setSelectedFee(fee);
                                    setPaymentData(prev => ({ ...prev, amount: fee.remainingAmount.toString() }));
                                  }}
                                >
                                  <CreditCard className="h-4 w-4 mr-1" />
                                  Pay
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Make Payment</DialogTitle>
                                  <DialogDescription>
                                    Pay for {fee.feeStructureName}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="bg-blue-50 p-4 rounded-lg">
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">Fee:</span>
                                      <span>{fee.feeStructureName}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">Total Amount:</span>
                                      <span>₹{fee.totalAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="font-medium">Paid:</span>
                                      <span>₹{fee.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center font-semibold">
                                      <span>Remaining:</span>
                                      <span>₹{fee.remainingAmount.toLocaleString()}</span>
                                    </div>
                                  </div>

                                  <div>
                                    <Label htmlFor="amount">Payment Amount</Label>
                                    <Input
                                      id="amount"
                                      type="number"
                                      value={paymentData.amount}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
                                      max={fee.remainingAmount}
                                      placeholder="Enter amount"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="paymentMethod">Payment Method</Label>
                                    <Select value={paymentData.paymentMethod} onValueChange={(value) => setPaymentData(prev => ({ ...prev, paymentMethod: value }))}>
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="upi">UPI</SelectItem>
                                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="cheque">Cheque</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>

                                  <div>
                                    <Label htmlFor="transactionId">Transaction ID (Optional)</Label>
                                    <Input
                                      id="transactionId"
                                      value={paymentData.transactionId}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, transactionId: e.target.value }))}
                                      placeholder="Enter transaction ID"
                                    />
                                  </div>

                                  <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <Textarea
                                      id="notes"
                                      value={paymentData.notes}
                                      onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                                      placeholder="Any additional notes"
                                      rows={2}
                                    />
                                  </div>

                                  <div className="flex gap-3 pt-4">
                                    <Button onClick={handlePayment} className="flex-1">
                                      <CreditCard className="h-4 w-4 mr-2" />
                                      Pay ₹{paymentData.amount || '0'}
                                    </Button>
                                    <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Receipt className="h-4 w-4 mr-2" />
                Download All Receipts
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Fee Statement
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Phone className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Mail className="h-4 w-4 mr-2" />
                Email Receipts
              </Button>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Total Fees:</span>
                  <span className="font-semibold">₹{(totalPaid + totalDue).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Paid:</span>
                  <span className="font-semibold text-green-600">₹{totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Remaining:</span>
                  <span className="font-semibold text-orange-600">₹{totalDue.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm">Payment Rate:</span>
                  <span className="font-semibold">
                    {totalPaid + totalDue > 0 ? ((totalPaid / (totalPaid + totalDue)) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Dues */}
          {upcomingFees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Dues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingFees.slice(0, 3).map((fee) => (
                    <div key={fee.id} className="flex justify-between items-center">
                      <div>
                        <div className="text-sm font-medium">{fee.feeStructureName}</div>
                        <div className="text-xs text-gray-500">
                          Due: {format(fee.dueDate instanceof Date ? fee.dueDate : fee.dueDate.toDate(), 'MMM dd')}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ₹{fee.remainingAmount.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Charts Section */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>Your payment trend over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>How you prefer to pay</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Payments */}
      {payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Payments</CardTitle>
            <CardDescription>Your latest payment transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Fee</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Receipt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 5).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(payment.paymentDate instanceof Date ? payment.paymentDate : payment.paymentDate.toDate(), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{payment.feeStructureName}</TableCell>
                    <TableCell className="font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {payment.paymentMethod.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        {payment.receiptNumber}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}