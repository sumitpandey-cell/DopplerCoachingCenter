'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalytics, useAnnouncements, useMaterials } from '@/hooks/use-redux';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Bell, Calendar, Award, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';
import { animate, stagger } from "animejs";
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '@/app/store';
import type { RootState } from '@/app/store';

function Placeholder({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}

export default function StudentDashboard() {
  const { userProfile } = useAuth();
  const { setIsDataLoading } = useDataLoading();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  const testResults: any[] = student?.testResults || [];
  const studyMaterials: any[] = student?.materials || [];
  const announcements: any[] = student?.announcements || [];

  // Calculate stats
  const totalTests = testResults.length;
  const averageScore = testResults.length > 0 ? Math.round(testResults.reduce((sum: number, t: any) => sum + t.percentage, 0) / testResults.length) : 0;
  const recentAnnouncements = announcements.slice(0, 3).length;

  // Set global loading state
  useEffect(() => {
    setIsDataLoading(studentStatus === 'loading');
  }, [studentStatus, setIsDataLoading]);

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i: number) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight dashboard-title">
              Welcome back, {student?.name || userProfile?.name}!
            </h1>
            <motion.p 
              className="text-gray-600 dark:text-gray-400 mt-2 text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              Here&apos;s your academic overview
            </motion.p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={studentStatus === 'loading' ? 'secondary' : 'default'}>
              {studentStatus}
            </Badge>
            <Button 
              onClick={() => {
                if (userProfile?.studentId) {
                  dispatch(fetchCurrentStudent(userProfile.studentId));
                }
              }}
              disabled={studentStatus === 'loading'}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${studentStatus === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Error Handling */}
      {studentStatus === 'failed' && (
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <Bell className="h-4 w-4" />
                <p>Failed to load dashboard data: {studentStatus === 'failed' ? 'Failed to fetch student data' : ''}</p>
                <Button onClick={() => dispatch(fetchCurrentStudent(userProfile?.studentId || ''))} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        {/* Total Tests */}
        <motion.div className="dashboard-card" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <Award className="h-5 w-5 text-yellow-500" />
                </motion.div>
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div className="text-3xl font-bold text-blue-700 dark:text-blue-300" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.6 }}>
                {totalTests}
              </motion.div>
              <p className="text-xs text-muted-foreground">Tests completed</p>
            </CardContent>
          </Card>
        </motion.div>
        {/* Average Score */}
        <motion.div className="dashboard-card" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 flex flex-col items-center justify-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div whileHover={{ scale: 1.2, rotate: 15 }} transition={{ duration: 0.3 }}>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </motion.div>
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <motion.div className="w-16 h-16 my-2" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.8 }}>
                <CircularProgressbar value={averageScore} text={`${averageScore}%`} styles={buildStyles({ textColor: '#16a34a', pathColor: '#16a34a', trailColor: '#e5e7eb', textSize: '18px' })} />
              </motion.div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </motion.div>
        {/* Study Materials */}
        <motion.div className="dashboard-card" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.6 }}>
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </motion.div>
                Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div className="text-3xl font-bold text-purple-700 dark:text-purple-300" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25, delay: 1.0 }}>
                {studyMaterials.length}
              </motion.div>
              <p className="text-xs text-muted-foreground">Available resources</p>
            </CardContent>
          </Card>
        </motion.div>
        {/* Announcements */}
        <motion.div className="dashboard-card" whileHover={{ scale: 1.05, y: -5 }} whileTap={{ scale: 0.98 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div whileHover={{ rotateY: 180 }} transition={{ duration: 0.6 }}>
                  <Bell className="h-5 w-5 text-orange-500" />
                </motion.div>
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div className="text-3xl font-bold text-orange-700 dark:text-orange-300" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 25, delay: 1.2 }}>
                {recentAnnouncements}
              </motion.div>
              <p className="text-xs text-muted-foreground">Recent updates</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
      {/* Recent Tests Section */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.6 }}>
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-yellow-500" />
              Recent Test Results
            </CardTitle>
            <CardDescription>Your latest test performances</CardDescription>
          </CardHeader>
          <CardContent>
            {testResults.length > 0 ? (
              <div className="space-y-4">
                {testResults.slice(0, 5).map((test: any, index: number) => (
                  <motion.div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.0 + index * 0.1, duration: 0.3 }}>
                    <div>
                      <p className="font-medium">{test.testName || 'Test'}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject || 'Subject'}</p>
                    </div>
                    <Badge variant={test.percentage >= 80 ? 'default' : test.percentage >= 60 ? 'secondary' : 'destructive'}>
                      {test.percentage}%
                    </Badge>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Placeholder icon={Award} title="No Test Results" description="Complete your first test to see results here" />
            )}
          </CardContent>
        </Card>
        <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-orange-500" />
              Recent Announcements
            </CardTitle>
            <CardDescription>Latest updates from your institution</CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.slice(0, 3).map((announcement: any, index: number) => (
                  <motion.div key={announcement.id} className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.2 + index * 0.1, duration: 0.3 }}>
                    <p className="font-medium text-orange-800 dark:text-orange-200">{announcement.title}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">{announcement.content}</p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <Placeholder icon={Bell} title="No Announcements" description="Check back later for updates" />
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}