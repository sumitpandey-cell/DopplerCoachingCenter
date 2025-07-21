'use client';

import React, { memo, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Bell, Calendar, Award, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { useOptimizedStudentDetails, useOptimizedAnnouncements } from '@/hooks/use-optimized-data';
import { usePerformanceMonitor } from '@/lib/performance-utils';
import OptimizedDashboardCards from './OptimizedDashboardCards';

// Memoized placeholder component
const Placeholder = memo<{ 
  icon: React.ElementType; 
  title: string; 
  description: string; 
}>(({ icon: Icon, title, description }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <Icon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400">{description}</p>
  </div>
));

Placeholder.displayName = 'Placeholder';

// Memoized test result item
const TestResultItem = memo<{ test: any; index: number }>(({ test, index }) => (
  <motion.div 
    key={test.id || index} 
    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}
  >
    <div>
      <p className="font-medium">{test.testName || 'Test'}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject || 'Subject'}</p>
    </div>
    <Badge variant={test.percentage >= 80 ? 'default' : test.percentage >= 60 ? 'secondary' : 'destructive'}>
      {test.percentage}%
    </Badge>
  </motion.div>
));

TestResultItem.displayName = 'TestResultItem';

// Memoized announcement item
const AnnouncementItem = memo<{ announcement: any; index: number }>(({ announcement, index }) => (
  <motion.div 
    key={announcement.id} 
    className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800"
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}
  >
    <p className="font-medium text-orange-800 dark:text-orange-200">{announcement.title}</p>
    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{announcement.content}</p>
  </motion.div>
));

AnnouncementItem.displayName = 'AnnouncementItem';

const OptimizedStudentDashboard = memo(() => {
  const { userProfile } = useAuth();
  const monitor = usePerformanceMonitor('StudentDashboard');
  
  // Optimized data fetching with React Query
  const { 
    data: student, 
    isLoading: studentLoading, 
    error: studentError,
    refetch: refetchStudent 
  } = useOptimizedStudentDetails(userProfile?.studentId || '');
  
  const { 
    data: announcementsData, 
    isLoading: announcementsLoading 
  } = useOptimizedAnnouncements(userProfile?.studentId, { limit: 3 });

  // Memoized computed values
  const dashboardStats = useMemo(() => {
    if (!student) return null;
    
    const testResults = student.testResults || [];
    const studyMaterials = student.materials || [];
    const announcements = announcementsData?.recent || [];
    
    return {
      totalTests: testResults.length,
      averageScore: student.averageScore || 0,
      studyMaterialsCount: studyMaterials.length,
      recentAnnouncementsCount: announcements.length,
    };
  }, [student, announcementsData]);

  // Memoized dashboard cards data
  const dashboardCards = useMemo(() => {
    if (!dashboardStats) return [];
    
    return [
      {
        label: 'Total Tests',
        value: dashboardStats.totalTests,
        icon: Award,
        href: '/student/tests',
        color: 'text-yellow-500',
        bgColor: 'from-yellow-50 to-orange-50',
        borderColor: 'border-yellow-200',
      },
      {
        label: 'Average Score',
        value: `${dashboardStats.averageScore}%`,
        icon: TrendingUp,
        href: '/student/performance',
        color: 'text-green-500',
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200',
      },
      {
        label: 'Study Materials',
        value: dashboardStats.studyMaterialsCount,
        icon: BookOpen,
        href: '/student/materials',
        color: 'text-blue-500',
        bgColor: 'from-blue-50 to-indigo-50',
        borderColor: 'border-blue-200',
      },
      {
        label: 'Announcements',
        value: dashboardStats.recentAnnouncementsCount,
        icon: Bell,
        href: '/student/announcements',
        color: 'text-orange-500',
        bgColor: 'from-orange-50 to-red-50',
        borderColor: 'border-orange-200',
      },
    ];
  }, [dashboardStats]);

  // Loading state
  if (studentLoading) {
    return (
      <div className="p-4 md:p-8 w-full">
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

  // Error state
  if (studentError) {
    return (
      <div className="p-4 md:p-8 w-full">
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={() => refetchStudent()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      {/* Header */}
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
              Welcome back, {student?.name || userProfile?.name}!
            </h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 mt-2 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Here's your academic overview
            </motion.p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="default">Online</Badge>
            <Button 
              onClick={() => refetchStudent()}
              disabled={studentLoading}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${studentLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Optimized Dashboard Cards */}
      {dashboardCards.length > 0 && (
        <OptimizedDashboardCards cards={dashboardCards} />
      )}

      {/* Recent Content */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8" 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        {/* Recent Test Results */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Recent Test Results
            </CardTitle>
            <CardDescription>Your latest test performances</CardDescription>
          </CardHeader>
          <CardContent>
            {student?.testResults?.length > 0 ? (
              <div className="space-y-4">
                {student.testResults.slice(0, 5).map((test: any, index: number) => (
                  <TestResultItem key={test.id || index} test={test} index={index} />
                ))}
              </div>
            ) : (
              <Placeholder 
                icon={Award} 
                title="No Test Results" 
                description="Complete your first test to see results here" 
              />
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Latest updates from your institution</CardDescription>
          </CardHeader>
          <CardContent>
            {announcementsData?.recent?.length > 0 ? (
              <div className="space-y-4">
                {announcementsData.recent.slice(0, 3).map((announcement: any, index: number) => (
                  <AnnouncementItem key={announcement.id} announcement={announcement} index={index} />
                ))}
              </div>
            ) : (
              <Placeholder 
                icon={Bell} 
                title="No Announcements" 
                description="Check back later for updates" 
              />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
});

OptimizedStudentDashboard.displayName = 'OptimizedStudentDashboard';

export default OptimizedStudentDashboard;