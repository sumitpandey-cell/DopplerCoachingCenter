'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, getAnnouncements, getStudyMaterials } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp, Bell, Calendar, Award } from 'lucide-react';
import Link from 'next/link';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { motion } from 'framer-motion';


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
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight">
          Welcome back, {userProfile?.name}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">Here&apos;s your academic overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <Card className="shadow-md hover:shadow-xl transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" /> Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalTests}</div>
              <p className="text-xs text-muted-foreground">Tests completed</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <Card className="shadow-md hover:shadow-xl transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-green-100 dark:border-green-800 flex flex-col items-center justify-center">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" /> Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-16 h-16 my-2">
                <CircularProgressbar
                  value={stats.averageScore}
                  text={`${stats.averageScore}%`}
                  styles={buildStyles({
                    textColor: '#16a34a',
                    pathColor: '#16a34a',
                    trailColor: '#e5e7eb',
                    textSize: '18px',
                  })}
                />
              </div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <Card className="shadow-md hover:shadow-xl transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-blue-100 dark:border-blue-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" /> Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.studyMaterials}</div>
              <p className="text-xs text-muted-foreground">Available resources</p>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
          <Card className="shadow-md hover:shadow-xl transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-orange-100 dark:border-orange-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-500" /> Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-300">{stats.recentAnnouncements}</div>
              <p className="text-xs text-muted-foreground">Recent updates</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Test Results & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-500" /> Recent Test Results
              </CardTitle>
              <CardDescription className="ml-auto">Your latest test performances</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <motion.div key={test.id} whileHover={{ scale: 1.02 }} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg transition-all">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{test.testName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={test.percentage >= 80 ? 'default' : test.percentage >= 60 ? 'secondary' : 'destructive'}>
                          {test.percentage}%
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.score}/{test.maxScore}</p>
                      </div>
                    </motion.div>
                  ))}
                  <Link href="/student/tests" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    View all results →
                  </Link>
                </div>
              ) : (
                <Placeholder icon={TrendingUp} title="No test results yet" description="Your recent test results will appear here once available." />
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-md hover:shadow-lg transition-shadow rounded-xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <LightningBoltIcon className="h-5 w-5 text-purple-500" /> Quick Actions
              </CardTitle>
              <CardDescription className="ml-auto">Access your most used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/student/materials" className="p-4 bg-blue-50 dark:bg-blue-900 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-800 transition-colors flex flex-col items-center group">
                  <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-300 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Study Materials</p>
                </Link>
                <Link href="/student/timetable" className="p-4 bg-green-50 dark:bg-green-900 rounded-lg hover:bg-green-100 dark:hover:bg-green-800 transition-colors flex flex-col items-center group">
                  <Calendar className="h-8 w-8 text-green-600 dark:text-green-300 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Timetable</p>
                </Link>
                <Link href="/student/performance" className="p-4 bg-purple-50 dark:bg-purple-900 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-800 transition-colors flex flex-col items-center group">
                  <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-300 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Performance</p>
                </Link>
                <Link href="/student/announcements" className="p-4 bg-orange-50 dark:bg-orange-900 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-800 transition-colors flex flex-col items-center group">
                  <Bell className="h-8 w-8 text-orange-600 dark:text-orange-300 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-medium">Announcements</p>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

// Add this icon for Quick Actions
function LightningBoltIcon(props: any) {
  return (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}