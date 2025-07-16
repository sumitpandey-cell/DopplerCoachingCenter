"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Users, AlertCircle, TrendingUp } from 'lucide-react';

interface FeeStatisticsProps {
  stats: {
    totalRevenue: number;
    pendingAmount: number;
    studentsWithDues: number;
    paymentsThisMonth: number;
  };
}

export default function FeeStatistics({ stats }: FeeStatisticsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="flex items-center p-6">
          <DollarSign className="h-8 w-8 text-green-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-6">
          <AlertCircle className="h-8 w-8 text-orange-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Pending Amount</p>
            <p className="text-2xl font-bold">₹{stats.pendingAmount.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-6">
          <Users className="h-8 w-8 text-blue-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">Students with Dues</p>
            <p className="text-2xl font-bold">{stats.studentsWithDues}</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center p-6">
          <TrendingUp className="h-8 w-8 text-purple-600" />
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-600">This Month</p>
            <p className="text-2xl font-bold">{stats.paymentsThisMonth}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 