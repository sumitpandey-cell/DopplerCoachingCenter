'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated, getAdminUser } from '@/firebase/admin-auth';
import AdminSidebar from '@/components/AdminSidebar';
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
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { getFeePayments } from '@/firebase/fees';
import { getInquiries } from '@/firebase/firestore';

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
      // 1. Total Registered Students (isActive only)
      const studentsSnap = await getDocs(collection(db, 'studentAccounts'));
      const allStudents = studentsSnap.docs.map(doc => doc.data());
      const activeStudentAccounts = allStudents.filter((s: any) => s.isActive !== false);
      const studentsCount = activeStudentAccounts.length;

      // 1b. Active/Visible Students (same logic as students page, but only isActive)
      const [testResults, allInquiries] = await Promise.all([
        getDocs(collection(db, 'testResults')),
        getInquiries(),
      ]);
      const testResultsArr = testResults.docs.map(doc => doc.data());
      const uniqueStudentIds = new Set(
        testResultsArr
          .filter((tr: any) => activeStudentAccounts.some((s: any) => s.studentId === tr.studentId))
          .map((tr: any) => tr.studentId)
      );
      // Add students from admitted inquiries (only if isActive)
      allInquiries
        .filter((inq: any) => inq.status === 'admitted')
        .forEach((inq: any) => {
          const student = activeStudentAccounts.find((s: any) => s.email === inq.email);
          if (student) uniqueStudentIds.add(student.email);
        });
      const activeStudentsCount = activeStudentAccounts.length;

      // 2. Active Faculty
      const facultySnap = await getDocs(collection(db, 'facultyAccounts'));
      const facultyCount = facultySnap.size;

      // 3. Monthly Revenue
      const allPayments = await getFeePayments();
      const now = new Date();
      const thisMonth = now.getMonth();
      const thisYear = now.getFullYear();
      const monthlyPayments = allPayments.filter((p: any) => {
        const d = p.paymentDate instanceof Date ? p.paymentDate : p.paymentDate?.toDate?.() || new Date(p.paymentDate);
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
      });
      const monthlyRevenue = monthlyPayments.reduce((sum: number, p: any) => sum + (p.amount || 0), 0);

      // 4. Pending Inquiries
      const pendingInquiries = allInquiries.filter((inq: any) => inq.status === 'pending').length;

      setStats({
        students: studentsCount,
        activeStudents: activeStudentsCount,
        faculty: facultyCount,
        revenue: monthlyRevenue,
        pendingInquiries,
      });
      setStatsLoading(false);
    };
    fetchStats();
  }, [router]);

  if (loading || statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!adminUser) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {adminUser.email}. Here&apos;s your system overview.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registered Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.students?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-muted-foreground">All student accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active/Visible Students</CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeStudents?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-muted-foreground">Appear in Students page</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Faculty</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.faculty?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-muted-foreground">Faculty accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{stats.revenue?.toLocaleString() ?? '-'}</div>
              <p className="text-xs text-muted-foreground">+8% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Inquiries</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingInquiries ?? '-'}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

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