'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getFeeAnalytics, getOverdueFees, getFeePayments } from '@/firebase/fees';
import { useToast } from '@/hooks/use-toast';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  AlertTriangle, 
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

interface AnalyticsData {
  totalCollected: number;
  totalDue: number;
  totalOverdue: number;
  collectionRate: number;
  paymentMethodBreakdown: Record<string, number>;
  monthlyTrend: Record<string, number>;
  totalStudentsWithDues: number;
  averagePaymentAmount: number;
}

export default function EnhancedFeeAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('3months');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      let range;
      const now = new Date();
      
      switch (dateRange) {
        case '1month':
          range = { from: subMonths(now, 1), to: now };
          break;
        case '3months':
          range = { from: subMonths(now, 3), to: now };
          break;
        case '6months':
          range = { from: subMonths(now, 6), to: now };
          break;
        case '1year':
          range = { from: subMonths(now, 12), to: now };
          break;
        default:
          range = undefined;
      }

      const data = await getFeeAnalytics(range);
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
    toast({
      title: 'Success',
      description: 'Analytics data refreshed',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCollectionRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCollectionRateBadge = (rate: number) => {
    if (rate >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (rate >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Attention</Badge>;
  };

  // Prepare chart data
  const monthlyTrendData = analytics ? Object.entries(analytics.monthlyTrend).map(([month, amount]) => ({
    month: format(new Date(month + '-01'), 'MMM yyyy'),
    amount,
    formattedAmount: formatCurrency(amount)
  })).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()) : [];

  const paymentMethodData = analytics ? Object.entries(analytics.paymentMethodBreakdown).map(([method, amount]) => ({
    name: method.replace('_', ' ').toUpperCase(),
    value: amount,
    formattedValue: formatCurrency(amount)
  })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">No analytics data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Fee Analytics Dashboard</h2>
          <p className="text-gray-600">Comprehensive fee collection and payment analytics</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(analytics.totalCollected)}
            </div>
            <p className="text-xs text-muted-foreground">
              Avg: {formatCurrency(analytics.averagePaymentAmount)} per payment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(analytics.totalDue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {analytics.totalStudentsWithDues} students with dues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(analytics.totalOverdue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCollectionRateColor(analytics.collectionRate)}`}>
              {analytics.collectionRate.toFixed(1)}%
            </div>
            <div className="flex items-center gap-2 mt-1">
              {getCollectionRateBadge(analytics.collectionRate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Collection Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Collection Trend</CardTitle>
            <CardDescription>Fee collection over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`} />
                <Tooltip 
                  formatter={(value: number) => [formatCurrency(value), 'Amount']}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Area 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Method Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Distribution</CardTitle>
            <CardDescription>How students prefer to pay</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Collection Efficiency */}
        <Card>
          <CardHeader>
            <CardTitle>Collection Efficiency</CardTitle>
            <CardDescription>Performance metrics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Collection Rate</span>
              <span className={`font-bold ${getCollectionRateColor(analytics.collectionRate)}`}>
                {analytics.collectionRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${Math.min(analytics.collectionRate, 100)}%` }}
              ></div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total Expected</span>
                <span>{formatCurrency(analytics.totalCollected + analytics.totalDue)}</span>
              </div>
              <div className="flex justify-between">
                <span>Collected</span>
                <span className="text-green-600">{formatCurrency(analytics.totalCollected)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pending</span>
                <span className="text-orange-600">{formatCurrency(analytics.totalDue)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Breakdown by method</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {paymentMethodData.map((method, index) => (
                <div key={method.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-sm font-medium">{method.name}</span>
                  </div>
                  <span className="text-sm font-bold">{method.formattedValue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Send Payment Reminders
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export Overdue Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Fee Collection
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Summary Statistics</CardTitle>
          <CardDescription>Key performance indicators for the selected period</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {((analytics.totalCollected / (analytics.totalCollected + analytics.totalDue)) * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Collection Efficiency</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(analytics.averagePaymentAmount)}
              </div>
              <div className="text-sm text-gray-600">Avg Payment</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {analytics.totalStudentsWithDues}
              </div>
              <div className="text-sm text-gray-600">Students with Dues</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analytics.paymentMethodBreakdown).length}
              </div>
              <div className="text-sm text-gray-600">Payment Methods</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}