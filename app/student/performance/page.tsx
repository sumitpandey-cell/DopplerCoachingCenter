'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PerformanceChart from '@/components/PerformanceChart';
import { TrendingUp, Award, Target, BookOpen, Users, BarChart2, FileText, MessageCircle } from 'lucide-react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

const MOCK_BATCH_OVERVIEW = {
  batch: 'Alpha 2024',
  average: 82,
  topScorers: [
    { name: 'Priya Sharma', score: 98 },
    { name: 'Rahul Kumar', score: 96 },
    { name: 'Ananya Singh', score: 95 },
    { name: 'Vikash Patel', score: 94 },
    { name: 'Rohit Sharma', score: 93 },
  ],
  improved: 12,
};

const MOCK_REMARKS = [
  { test: 'Math Test 1', remark: 'Great improvement!' },
  { test: 'Physics Test 1', remark: 'Needs more practice on numericals.' },
  { test: 'Chemistry Test 1', remark: 'Excellent conceptual clarity.' },
];

const FOCUS_THRESHOLD = 60;

export default function Performance() {
  const { userProfile } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestResults = async () => {
      if (!userProfile?.studentId) return;

      try {
        const results = await getTestResultsByStudent(userProfile.studentId);
        setTestResults(results);
      } catch (error) {
        console.error('Error fetching test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const totalTests = testResults.length;
  const totalScore = testResults.reduce((sum, test) => sum + test.percentage, 0);
  const averageScore = totalTests > 0 ? totalScore / totalTests : 0;
  const highestScore = testResults.length > 0 ? Math.max(...testResults.map(t => t.percentage)) : 0;
  const improvementTrend = testResults.length >= 2 
    ? testResults[0].percentage - testResults[testResults.length - 1].percentage 
    : 0;

  const subjectStats = testResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { total: 0, count: 0, scores: [] };
    }
    acc[result.subject].total += result.percentage;
    acc[result.subject].count += 1;
    acc[result.subject].scores.push(result.percentage);
    return acc;
  }, {} as Record<string, { total: number; count: number; scores: number[] }>);

  return (
    <div className="p-4 md:p-8 w-full space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-green-700 dark:text-green-300 mb-2 tracking-tight">Performance Board</h1>
        <p className="text-gray-600 dark:text-gray-400">Track your academic progress and achievements</p>
      </div>

      {/* 1. Student Score Tracker Table */}
      <Card className="mb-8 border border-blue-100 dark:border-blue-800 shadow rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
            <FileText className="h-5 w-5" /> Score Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50 dark:bg-blue-900">
                  <TableHead>Test Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Total Marks</TableHead>
                  <TableHead>Remarks</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {testResults.map((test, idx) => (
                  <TableRow key={test.id} className="border-b border-gray-100 dark:border-gray-800">
                    <TableCell className="font-medium">{test.testName}</TableCell>
                    <TableCell>{test.testDate?.toLocaleDateString?.() || '-'}</TableCell>
                    <TableCell>{test.score}</TableCell>
                    <TableCell>{test.maxScore}</TableCell>
                    <TableCell>{MOCK_REMARKS.find(r => r.test === test.testName)?.remark || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="transition-transform hover:scale-[1.03]">
          <Card className="border border-blue-100 dark:border-blue-800 shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
              <Award className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalTests}</div>
              <p className="text-xs text-muted-foreground">Tests completed</p>
            </CardContent>
          </Card>
        </div>
        <div className="transition-transform hover:scale-[1.03]">
          <Card className="border border-green-100 dark:border-green-800 shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{Math.round(averageScore)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </div>
        <div className="transition-transform hover:scale-[1.03]">
          <Card className="border border-purple-100 dark:border-purple-800 shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              <Target className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{highestScore}%</div>
              <p className="text-xs text-muted-foreground">Best performance</p>
            </CardContent>
          </Card>
        </div>
        <div className="transition-transform hover:scale-[1.03]">
          <Card className="border border-orange-100 dark:border-orange-800 shadow-md rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Improvement</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {improvementTrend >= 0 ? '+' : ''}{Math.round(improvementTrend)}%
              </div>
              <p className="text-xs text-muted-foreground">Since first test</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {testResults.length > 0 ? (
        <>
          {/* Performance Charts */}
          <Card className="mb-8 border border-gray-100 dark:border-gray-800 shadow rounded-xl">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Visual representation of your academic progress</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart testResults={testResults} />
            </CardContent>
          </Card>

          {/* 2. Batch-wise Performance Overview */}
          <Card className="mb-8 border border-green-100 dark:border-green-800 shadow rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <BarChart2 className="h-5 w-5" /> Batch-wise Performance Overview
              </CardTitle>
              <CardDescription>Batch: {MOCK_BATCH_OVERVIEW.batch}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">Average Score</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-300 mb-4">{MOCK_BATCH_OVERVIEW.average}%</div>
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">Number of Students Improved</div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-300 mb-4">{MOCK_BATCH_OVERVIEW.improved}</div>
                </div>
                <div className="flex-1">
                  <div className="mb-2 text-sm text-gray-600 dark:text-gray-400">Top 5 Scorers</div>
                  <ul className="space-y-2">
                    {MOCK_BATCH_OVERVIEW.topScorers.map((s, i) => (
                      <li key={s.name} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-400" />
                        <span className="font-medium text-gray-900 dark:text-gray-100">{s.name}</span>
                        <span className="ml-auto text-green-700 dark:text-green-300 font-bold">{s.score}%</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 3. Individual Student Report Card */}
          <Card className="border border-purple-100 dark:border-purple-800 shadow rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <FileText className="h-5 w-5" /> Individual Report Card
              </CardTitle>
              <CardDescription>Detailed report for your academic journey</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="font-semibold mb-2">Test-wise Scores</div>
                <ul className="space-y-1">
                  {testResults.map((test) => (
                    <li key={test.id} className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{test.testName}</span>
                      <span className="ml-auto text-blue-700 dark:text-blue-300 font-bold">{test.score}/{test.maxScore}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-2">Performance Trend</div>
                <PerformanceChart testResults={testResults} />
              </div>
              <div className="mb-4">
                <div className="font-semibold mb-2">Faculty Remarks</div>
                <ul className="space-y-1">
                  {MOCK_REMARKS.map((r, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-purple-400" />
                      <span className="font-medium text-gray-900 dark:text-gray-100">{r.test}:</span>
                      <span className="text-gray-700 dark:text-gray-300">{r.remark}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-semibold mb-2">Focus Areas</div>
                <ul className="space-y-1">
                  {Object.entries(subjectStats)
                    .filter(([subject, stats]) => (stats.total / stats.count) < FOCUS_THRESHOLD)
                    .map(([subject, stats]) => (
                      <li key={subject} className="flex items-center gap-2 text-sm">
                        <span className="font-medium text-red-600 dark:text-red-400">{subject}</span>
                        <span className="text-gray-700 dark:text-gray-300">(Avg: {Math.round(stats.total / stats.count)}%)</span>
                      </li>
                    ))}
                  {Object.entries(subjectStats).filter(([subject, stats]) => (stats.total / stats.count) < FOCUS_THRESHOLD).length === 0 && (
                    <li className="text-green-600 dark:text-green-300 text-sm">No weak subjects! Keep it up!</li>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <div className="text-center py-12">
          <TrendingUp className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No performance data available</h3>
          <p className="text-gray-500">
            Your performance analytics will appear here once you complete some tests
          </p>
        </div>
      )}
    </div>
  );
}