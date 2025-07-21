'use client';

import React, { useEffect, useState } from 'react';
import { getAllTestResults, getStudyMaterials, getAnnouncements, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Award, Calendar, Target, Activity, BarChart3 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchAnalytics } from '../../store';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export default function AdminAnalytics() {
  const dispatch = useDispatch<AppDispatch>();
  const analyticsState = useSelector((state: RootState) => state.analytics);
  const { data: analytics, status: analyticsStatus, error: analyticsError } = analyticsState;
  const { setIsDataLoading } = useDataLoading();

  useEffect(() => {
    if (analyticsStatus === 'idle') {
      dispatch(fetchAnalytics());
    }
  }, [dispatch, analyticsStatus]);

  // Set isDataLoading only for analytics summary (critical)
  useEffect(() => {
    setIsDataLoading(analyticsStatus === 'loading');
  }, [analyticsStatus, setIsDataLoading]);

  // Prepare chart data
  const performanceData = analytics?.testResults
    .slice(-10)
    .map((result, index) => ({
      test: `Test ${index + 1}`,
      score: result.percentage,
      subject: result.subject,
    }));

  const subjectData = analytics?.testResults.reduce((acc, result) => {
    if (!acc[result.subject]) {
      acc[result.subject] = { subject: result.subject, count: 0, totalScore: 0 };
    }
    acc[result.subject].count += 1;
    acc[result.subject].totalScore += result.percentage;
    return acc;
  }, {} as Record<string, { subject: string; count: number; totalScore: number }>);

  const subjectChartData = Object.values(subjectData).map(data => ({
    subject: data.subject,
    averageScore: Math.round(data.totalScore / data.count),
    testCount: data.count,
  }));

  const pieData = Object.values(subjectData).map(data => ({
    name: data.subject,
    value: data.count,
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  // Simple skeleton for analytics
  function AnalyticsSkeleton() {
    return (
      <div className="space-y-4">
        <div className="h-8 w-1/4 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-96 bg-gray-200 rounded animate-pulse" />
      </div>
    );
  }

  if (analyticsStatus === 'loading') {
    // Only show a minimal spinner while checking auth (if needed)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Analytics</h1>
        {analyticsStatus === 'loading' ? <AnalyticsSkeleton /> : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
              <p className="text-gray-600">Comprehensive insights into student performance and system usage</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">
                    <span className="text-green-600">+{analytics?.monthlyGrowth}%</span> from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Conducted</CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalTests}</div>
                  <p className="text-xs text-muted-foreground">Total assessments</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">Overall performance</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.studyMaterials}</div>
                  <p className="text-xs text-muted-foreground">Resources available</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Performance Trend */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    Performance Trend
                  </CardTitle>
                  <CardDescription>Recent test performance overview</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="test" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Score']} />
                        <Line 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Subject Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Test Distribution by Subject
                  </CardTitle>
                  <CardDescription>Number of tests per subject</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
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
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Subject Performance */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2" />
                  Subject-wise Performance
                </CardTitle>
                <CardDescription>Average scores and test counts by subject</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subjectChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="subject" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'averageScore' ? `${value}%` : value,
                          name === 'averageScore' ? 'Average Score' : 'Test Count'
                        ]}
                      />
                      <Bar dataKey="averageScore" fill="#3b82f6" name="Average Score" />
                      <Bar dataKey="testCount" fill="#10b981" name="Test Count" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Performing Subjects</CardTitle>
                  <CardDescription>Subjects with highest average scores</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectChartData
                      .sort((a, b) => b.averageScore - a.averageScore)
                      .slice(0, 5)
                      .map((subject, index) => (
                        <div key={subject.subject} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{subject.subject}</span>
                          </div>
                          <span className="text-sm font-bold text-green-600">
                            {subject.averageScore}%
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Most Active Subjects</CardTitle>
                  <CardDescription>Subjects with most tests conducted</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {subjectChartData
                      .sort((a, b) => b.testCount - a.testCount)
                      .slice(0, 5)
                      .map((subject, index) => (
                        <div key={subject.subject} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">{index + 1}</Badge>
                            <span className="font-medium">{subject.subject}</span>
                          </div>
                          <span className="text-sm font-bold text-blue-600">
                            {subject.testCount} tests
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Current system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Database</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">File Storage</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Authentication</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Notifications</span>
                      <Badge variant="default">Operational</Badge>
                    </div>
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600">
                        <p>Uptime: 99.9%</p>
                        <p>Last updated: Just now</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}