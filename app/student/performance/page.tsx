'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import PerformanceChart from '@/components/PerformanceChart';
import { TrendingUp, Award, Target, BookOpen } from 'lucide-react';

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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Performance Board</h1>
        <p className="text-gray-600">Track your academic progress and achievements</p>
      </div>

      {/* Performance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTests}</div>
            <p className="text-xs text-muted-foreground">Tests completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(averageScore)}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highestScore}%</div>
            <p className="text-xs text-muted-foreground">Best performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Improvement</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${improvementTrend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {improvementTrend >= 0 ? '+' : ''}{Math.round(improvementTrend)}%
            </div>
            <p className="text-xs text-muted-foreground">Since first test</p>
          </CardContent>
        </Card>
      </div>

      {testResults.length > 0 ? (
        <>
          {/* Performance Charts */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
              <CardDescription>Visual representation of your academic progress</CardDescription>
            </CardHeader>
            <CardContent>
              <PerformanceChart testResults={testResults} />
            </CardContent>
          </Card>

          {/* Subject-wise Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Subject-wise Performance</CardTitle>
              <CardDescription>Detailed breakdown by subject</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(subjectStats).map(([subject, stats]) => {
                  const average = stats.total / stats.count;
                  const highest = Math.max(...stats.scores);
                  const lowest = Math.min(...stats.scores);
                  
                  return (
                    <div key={subject} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{subject}</h3>
                        <BookOpen className="h-4 w-4 text-gray-500" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Average:</span>
                          <Badge variant={average >= 80 ? 'default' : average >= 60 ? 'secondary' : 'destructive'}>
                            {Math.round(average)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Highest:</span>
                          <span className="font-medium">{highest}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Lowest:</span>
                          <span className="font-medium">{lowest}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Tests:</span>
                          <span className="font-medium">{stats.count}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
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