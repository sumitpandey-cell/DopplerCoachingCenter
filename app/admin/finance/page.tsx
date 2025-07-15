'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { DollarSign, Search, Plus, TrendingUp, CreditCard, Users, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';

interface Payment {
  id: string;
  studentName: string;
  studentId: string;
  amount: number;
  course: string;
  paymentDate: Date;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue';
  paymentMethod: 'cash' | 'card' | 'upi' | 'bank_transfer';
  description: string;
}

export default function AdminFinance() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: '1',
      studentName: 'Rahul Sharma',
      studentId: 'STU001',
      amount: 15000,
      course: 'JEE Main & Advanced',
      paymentDate: new Date(2024, 11, 15),
      dueDate: new Date(2024, 11, 10),
      status: 'paid',
      paymentMethod: 'upi',
      description: 'Monthly fee - December 2024',
    },
    {
      id: '2',
      studentName: 'Priya Patel',
      studentId: 'STU002',
      amount: 12000,
      course: 'NEET',
      paymentDate: new Date(2024, 11, 20),
      dueDate: new Date(2024, 11, 10),
      status: 'paid',
      paymentMethod: 'card',
      description: 'Monthly fee - December 2024',
    },
    {
      id: '3',
      studentName: 'Amit Kumar',
      studentId: 'STU003',
      amount: 15000,
      course: 'JEE Main & Advanced',
      paymentDate: new Date(),
      dueDate: new Date(2024, 11, 25),
      status: 'pending',
      paymentMethod: 'bank_transfer',
      description: 'Monthly fee - December 2024',
    },
    {
      id: '4',
      studentName: 'Sneha Gupta',
      studentId: 'STU004',
      amount: 10000,
      course: 'Class 12th Science',
      paymentDate: new Date(),
      dueDate: new Date(2024, 11, 5),
      status: 'overdue',
      paymentMethod: 'cash',
      description: 'Monthly fee - December 2024',
    },
  ]);

  const [filteredPayments, setFilteredPayments] = useState<Payment[]>(payments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const [newPayment, setNewPayment] = useState({
    studentName: '',
    studentId: '',
    amount: 0,
    course: '',
    dueDate: '',
    paymentMethod: 'upi' as const,
    description: '',
  });

  React.useEffect(() => {
    let filtered = payments;

    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    setFilteredPayments(filtered);
  }, [payments, searchTerm, statusFilter]);

  const handleAddPayment = () => {
    const payment: Payment = {
      id: `PAY${Date.now()}`,
      ...newPayment,
      paymentDate: new Date(),
      dueDate: new Date(newPayment.dueDate),
      status: 'pending',
    };

    setPayments(prev => [...prev, payment]);
    setNewPayment({
      studentName: '',
      studentId: '',
      amount: 0,
      course: '',
      dueDate: '',
      paymentMethod: 'upi',
      description: '',
    });
    setShowAddModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge variant="outline">Cash</Badge>;
      case 'card':
        return <Badge variant="outline">Card</Badge>;
      case 'upi':
        return <Badge variant="outline">UPI</Badge>;
      case 'bank_transfer':
        return <Badge variant="outline">Bank Transfer</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Calculate financial metrics
  const totalRevenue = payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
  const overdueAmount = payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0);

  // Monthly revenue data (mock)
  const monthlyData = [
    { month: 'Jul', revenue: 180000, students: 45 },
    { month: 'Aug', revenue: 195000, students: 48 },
    { month: 'Sep', revenue: 210000, students: 52 },
    { month: 'Oct', revenue: 225000, students: 55 },
    { month: 'Nov', revenue: 240000, students: 58 },
    { month: 'Dec', revenue: 255000, students: 62 },
  ];

  // Course revenue data
  const courseData = payments.reduce((acc, payment) => {
    if (payment.status === 'paid') {
      if (!acc[payment.course]) {
        acc[payment.course] = 0;
      }
      acc[payment.course] += payment.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const courseChartData = Object.entries(courseData).map(([course, revenue]) => ({
    course,
    revenue,
  }));

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Overview</h1>
            <p className="text-gray-600">Manage payments, revenue, and financial reports</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
            <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Record New Payment</DialogTitle>
                  <DialogDescription>Add a new payment record</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="studentName">Student Name</Label>
                      <Input
                        id="studentName"
                        value={newPayment.studentName}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, studentName: e.target.value }))}
                        placeholder="Enter student name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input
                        id="studentId"
                        value={newPayment.studentId}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, studentId: e.target.value }))}
                        placeholder="Enter student ID"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="amount">Amount (₹)</Label>
                      <Input
                        id="amount"
                        type="number"
                        value={newPayment.amount}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={newPayment.dueDate}
                        onChange={(e) => setNewPayment(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="course">Course</Label>
                    <select
                      id="course"
                      value={newPayment.course}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, course: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="">Select Course</option>
                      <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                      <option value="NEET">NEET</option>
                      <option value="Class 11th Science">Class 11th Science</option>
                      <option value="Class 12th Science">Class 12th Science</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <select
                      id="paymentMethod"
                      value={newPayment.paymentMethod}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, paymentMethod: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank_transfer">Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={newPayment.description}
                      onChange={(e) => setNewPayment(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Payment description"
                    />
                  </div>
                  <Button onClick={handleAddPayment} className="w-full">
                    Add Payment
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Financial Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'pending').length} payments pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{overdueAmount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'overdue').length} overdue payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round((payments.filter(p => p.status === 'paid').length / payments.length) * 100)}%
            </div>
            <p className="text-xs text-muted-foreground">Payment collection rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue Trend</CardTitle>
            <CardDescription>Revenue growth over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Course</CardTitle>
            <CardDescription>Course-wise revenue breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="course" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Payment Records</CardTitle>
              <CardDescription>Manage student payments and fees</CardDescription>
            </div>
            <div className="flex space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium">{payment.studentName}</h3>
                    <p className="text-sm text-gray-600">ID: {payment.studentId}</p>
                  </div>
                  <div>
                    <p className="font-medium">{payment.course}</p>
                    <p className="text-sm text-gray-600">{payment.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">₹{payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">
                      Due: {format(payment.dueDate, 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="flex flex-col space-y-1">
                    {getStatusBadge(payment.status)}
                    {getPaymentMethodBadge(payment.paymentMethod)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}