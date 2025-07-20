'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated, getAdminUser } from '@/firebase/admin-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Bell,
  UserCheck,
  FileText,
  Clock,
  Award
} from 'lucide-react';

// Simple skeleton for stats cards
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {[...Array(5)].map((_, i) => (
        <Card key={i} className="bg-gradient-to-br from-gray-100 to-gray-200 border-0 shadow-md animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-4 w-24 bg-gray-300 rounded" />
            <div className="h-4 w-4 bg-gray-300 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-20 bg-gray-300 rounded mb-2" />
            <div className="h-3 w-16 bg-gray-200 rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [stats, setStats] = useState({
    students: null as number | null, // Total registered
    activeStudents: null as number | null, // Active/visible
    faculty: null as number | null,
    revenue: null as number | null,
    pendingInquiries: null as number | null,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/');
      return;
    }
    setAdminUser(getAdminUser());
    setLoading(false);
    // Fetch dashboard stats
    const fetchStats = async () => {
      const res = await fetch('/api/dashboard-stats');
      const statsData = await res.json();
      setStats(statsData);
      setStatsLoading(false);
    };
    fetchStats();
  }, []);

  if (loading) {
    // Only show a minimal spinner while checking auth
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {adminUser.email}. Here&apos;s your system overview.
          </p>
        </div>

        {/* Quick Stats */}
        {statsLoading ? <StatsSkeleton /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-700">Total Registered Students</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-blue-900">{stats.students?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-blue-700">All student accounts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-700">Active/Visible Students</CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-green-900">{stats.activeStudents?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-green-700">Appear in Students page</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-700">Active Faculty</CardTitle>
              <Users className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-purple-900">{stats.faculty?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-purple-700">Faculty accounts</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-100 to-yellow-100 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-orange-700">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-orange-900">₹{stats.revenue?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-orange-700">+8% from last month</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-pink-100 to-red-100 border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-pink-700">Pending Inquiries</CardTitle>
              <Bell className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-pink-900">{stats.pendingInquiries ?? '-'}</div>
              <p className="text-xs text-pink-700">Requires attention</p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest system activities and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">New student enrollment</p>
                    <p className="text-xs text-gray-600">John Doe enrolled in JEE Main course</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                  <div className="p-2 bg-green-100 rounded-full">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Study material uploaded</p>
                    <p className="text-xs text-gray-600">Physics Chapter 5 notes added</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg">
                  <div className="p-2 bg-orange-100 rounded-full">
                    <Bell className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">New announcement</p>
                    <p className="text-xs text-gray-600">Holiday schedule updated</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Frequently used admin functions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer">
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">Manage Users</p>
                  <p className="text-xs text-gray-600">Add/edit students &apos; faculty</p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors cursor-pointer">
                  <BookOpen className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium">Content</p>
                  <p className="text-xs text-gray-600">Manage study materials</p>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors cursor-pointer">
                  <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">Schedule</p>
                  <p className="text-xs text-gray-600">Manage timetables</p>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors cursor-pointer">
                  <TrendingUp className="h-8 w-8 text-orange-600 mb-2" />
                  <p className="font-medium">Analytics</p>
                  <p className="text-xs text-gray-600">View reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Current system health and performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">Database</h3>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">File Storage</h3>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
              
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <h3 className="font-medium">Authentication</h3>
                <p className="text-sm text-gray-600">Operational</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}