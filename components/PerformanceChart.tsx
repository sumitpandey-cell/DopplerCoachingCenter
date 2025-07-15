'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TestResult } from '@/firebase/firestore';

interface PerformanceChartProps {
  testResults: TestResult[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ testResults }) => {
  const chartData = testResults
    .slice(-10) // Last 10 tests
    .map((result, index) => ({
      test: `Test ${index + 1}`,
      percentage: result.percentage,
      score: result.score,
      maxScore: result.maxScore,
      subject: result.subject,
    }));

  const subjectPerformance = testResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { total: 0, count: 0 };
    }
    acc[result.subject].total += result.percentage;
    acc[result.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjectData = Object.entries(subjectPerformance).map(([subject, data]) => ({
    subject,
    average: Math.round(data.total / data.count),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="test" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value, name) => [`${value}%`, 'Percentage']}
                labelFormatter={(label) => `Test: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="percentage" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Subject-wise Average Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={subjectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="subject" />
              <YAxis domain={[0, 100]} />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Average']}
              />
              <Bar dataKey="average" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;