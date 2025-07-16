'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, getAnnouncements, getStudyMaterials } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Bell, Calendar, Award } from 'lucide-react';
import Link from 'next/link';

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalTests: 0,
    averageScore: 0,
    recentAnnouncements: 0,
    studyMaterials: 0,
  });
  const [recentTests, setRecentTests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!userProfile?.studentId) return;

      try {
        const [testResults, announcements, materials] = await Promise.all([
          getTestResultsByStudent(userProfile.studentId),
          getAnnouncements(),
          getStudyMaterials(),
        ]);

        const totalScore = testResults.reduce((sum, test) => sum + test.percentage, 0);
        const averageScore = testResults.length > 0 ? totalScore / testResults.length : 0;

        setStats({
          totalTests: testResults.length,
          averageScore: Math.round(averageScore),
          recentAnnouncements: announcements.slice(0, 3).length,
          studyMaterials: materials.length,
        });

        setRecentTests(testResults.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [userProfile]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {userProfile?.name}!
        </h1>
        <p className="text-gray-600 mt-2">Here&apos;s your academic overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Tests completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyMaterials}</div>
            <p className="text-xs text-muted-foreground">Available resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentAnnouncements}</div>
            <p className="text-xs text-muted-foreground">Recent updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Recent Test Results</CardTitle>
            <CardDescription>Your latest test performances</CardDescription>
          </CardHeader>
          <CardContent>
            {recentTests.length > 0 ? (
              <div className="space-y-4">
                {recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{test.testName}</p>
                      <p className="text-sm text-gray-600">{test.subject}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={test.percentage >= 80 ? 'default' : test.percentage >= 60 ? 'secondary' : 'destructive'}>
                        {test.percentage}%
                      </Badge>
                      <p className="text-sm text-gray-600">{test.score}/{test.maxScore}</p>
                    </div>
                  </div>
                ))}
                <Link href="/student/tests" className="text-blue-600 hover:underline text-sm">
                  View all results →
                </Link>
              </div>
            ) : (
              <p className="text-gray-500">No test results available yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/student/materials" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <BookOpen className="h-8 w-8 text-blue-600 mb-2" />
                <p className="font-medium">Study Materials</p>
              </Link>
              <Link href="/student/timetable" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Calendar className="h-8 w-8 text-green-600 mb-2" />
                <p className="font-medium">Timetable</p>
              </Link>
              <Link href="/student/performance" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <p className="font-medium">Performance</p>
              </Link>
              <Link href="/student/announcements" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Bell className="h-8 w-8 text-orange-600 mb-2" />
                <p className="font-medium">Announcements</p>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}