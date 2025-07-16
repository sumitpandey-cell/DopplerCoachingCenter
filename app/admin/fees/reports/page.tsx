"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getFeePayments } from '@/firebase/fees';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE'];

function aggregateMonthlyCollections(payments: any[]) {
  const monthly: Record<string, number> = {};
  payments.forEach((p) => {
    const date = p.paymentDate && p.paymentDate.toDate ? p.paymentDate.toDate() : new Date(p.paymentDate);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthly[key] = (monthly[key] || 0) + p.amount;
  });
  return Object.entries(monthly).map(([month, total]) => ({ month, total }));
}

function aggregateByMethod(payments: any[]) {
  const byMethod: Record<string, number> = {};
  payments.forEach((p) => {
    byMethod[p.paymentMethod] = (byMethod[p.paymentMethod] || 0) + p.amount;
  });
  return Object.entries(byMethod).map(([method, total]) => ({ method, total }));
}

export default function AdminFeeReportsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFeePayments().then((data) => {
      setPayments(data);
      setLoading(false);
    });
  }, []);

  const monthlyData = aggregateMonthlyCollections(payments);
  const methodData = aggregateByMethod(payments);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Fee Reports & Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Fee Collections</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Payments by Method</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={methodData}
                    dataKey="total"
                    nameKey="method"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 