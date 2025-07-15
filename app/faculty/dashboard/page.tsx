'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllTestResults, getAnnouncements, getStudyMaterials } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Bell, TrendingUp, Upload, ClipboardList } from 'lucide-react';
import Link from 'next/link';

export default function FacultyDashboard() {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTests: 0,
    studyMaterials: 0,
    announcements: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [testResults, announcements, materials] = await Promise.all([
          getAllTestResults(),
          getAnnouncements(),
          getStudyMaterials(),
        ]);

        // Get unique students from test results
        const uniqueStudents = new Set(testResults.map(test => test.studentId));

        setStats({
          totalStudents: uniqueStudents.size,
          totalTests: testResults.length,
          studyMaterials: materials.length,
          announcements: announcements.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <p className="text-gray-600 mt-2">Faculty Dashboard - Manage your classes and students</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">Active students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tests Conducted</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground">Total assessments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Materials</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyMaterials}</div>
            <p className="text-xs text-muted-foreground">Uploaded resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Announcements</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.announcements}</div>
            <p className="text-xs text-muted-foreground">Posted notices</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your most used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Link href="/faculty/upload-materials" className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <Upload className="h-8 w-8 text-blue-600 mb-2" />
                <p className="font-medium">Upload Materials</p>
              </Link>
              <Link href="/faculty/enter-scores" className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <ClipboardList className="h-8 w-8 text-green-600 mb-2" />
                <p className="font-medium">Enter Scores</p>
              </Link>
              <Link href="/faculty/students" className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <p className="font-medium">View Students</p>
              </Link>
              <Link href="/faculty/post-announcements" className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                <Bell className="h-8 w-8 text-orange-600 mb-2" />
                <p className="font-medium">Post Announcement</p>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Overview of recent actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-blue-100 rounded-full">
                  <BookOpen className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Study materials uploaded</p>
                  <p className="text-xs text-gray-600">{stats.studyMaterials} total resources</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Tests conducted</p>
                  <p className="text-xs text-gray-600">{stats.totalTests} assessments completed</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="p-2 bg-orange-100 rounded-full">
                  <Bell className="h-4 w-4 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-sm">Announcements posted</p>
                  <p className="text-xs text-gray-600">{stats.announcements} notices published</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}