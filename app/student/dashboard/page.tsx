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
import {animate, stagger} from "animejs"

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

  // Anime.js animations
  useEffect(() => {
    if (!loading) {
      animate('.square', {
        x: '17rem',
        delay: stagger(100),
        duration: stagger(200, { start: 500 }),
        loop: true,
        alternate: true
      });

      animate('.square', {
        x: '17rem',
        delay: stagger(100),
        duration: stagger(200, { start: 500 }),
        loop: true,
        alternate: true
      });
    }
  }, [loading]);

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
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight dashboard-title">
          Welcome back, {userProfile?.name}!
        </h1>
        <motion.p 
          className="text-gray-600 dark:text-gray-400 mt-2 text-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Here&apos;s your academic overview
        </motion.p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <motion.div 
          className="dashboard-card"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <Award className="h-5 w-5 text-yellow-500" />
                </motion.div>
                Total Tests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-3xl font-bold text-blue-700 dark:text-blue-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.6 }}
              >
                {stats.totalTests}
              </motion.div>
              <p className="text-xs text-muted-foreground">Tests completed</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="dashboard-card"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border border-green-200 dark:border-green-800 flex flex-col items-center justify-center overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 w-full">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </motion.div>
                Average Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <motion.div 
                className="w-16 h-16 my-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.8 }}
              >
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
              </motion.div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="dashboard-card"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950 border border-purple-200 dark:border-purple-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div
                  whileHover={{ rotateY: 180 }}
                  transition={{ duration: 0.6 }}
                >
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </motion.div>
                Study Materials
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-3xl font-bold text-purple-700 dark:text-purple-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 1.0 }}
              >
                {stats.studyMaterials}
              </motion.div>
              <p className="text-xs text-muted-foreground">Available resources</p>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div 
          className="dashboard-card"
          whileHover={{ scale: 1.05, y: -5 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Card className="shadow-lg hover:shadow-2xl transition-all duration-300 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border border-orange-200 dark:border-orange-800 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 rounded-full -translate-y-10 translate-x-10"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <motion.div
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.2
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Bell className="h-5 w-5 text-orange-500" />
                </motion.div>
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div 
                className="text-3xl font-bold text-orange-600 dark:text-orange-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 25, delay: 1.2 }}
              >
                {stats.recentAnnouncements}
              </motion.div>
              <p className="text-xs text-muted-foreground">Recent updates</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recent Test Results & Quick Actions */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 15 }}
                  transition={{ duration: 0.3 }}
                >
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </motion.div>
                Recent Test Results
              </CardTitle>
              <CardDescription className="ml-auto">Your latest test performances</CardDescription>
            </CardHeader>
            <CardContent>
              {recentTests.length > 0 ? (
                <div className="space-y-4">
                  {recentTests.map((test) => (
                    <motion.div 
                      key={test.id} 
                      whileHover={{ scale: 1.02, x: 4 }} 
                      className="flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900 rounded-xl transition-all border border-gray-200 dark:border-gray-700"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * recentTests.indexOf(test) }}
                    >
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{test.testName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.subject}</p>
                      </div>
                      <div className="text-right">
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          <Badge variant={test.percentage >= 80 ? 'default' : test.percentage >= 60 ? 'secondary' : 'destructive'}>
                          {test.percentage}%
                          </Badge>
                        </motion.div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{test.score}/{test.maxScore}</p>
                      </div>
                    </motion.div>
                  ))}
                  <motion.div whileHover={{ x: 4 }}>
                    <Link href="/student/tests" className="text-blue-600 dark:text-blue-400 hover:underline text-sm">
                    View all results →
                    </Link>
                  </motion.div>
                </div>
              ) : (
                <Placeholder icon={TrendingUp} title="No test results yet" description="Your recent test results will appear here once available." />
              )}
            </CardContent>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <motion.div
                  whileHover={{ 
                    scale: 1.2,
                    filter: "drop-shadow(0 0 8px rgba(168, 85, 247, 0.4))"
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <LightningBoltIcon className="h-5 w-5 text-purple-500" />
                </motion.div>
                Quick Actions
              </CardTitle>
              <CardDescription className="ml-auto">Access your most used features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/student/materials" className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 rounded-xl hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-800 dark:hover:to-indigo-800 transition-all duration-300 flex flex-col items-center group border border-blue-200 dark:border-blue-800">
                    <motion.div
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-300 mb-2" />
                    </motion.div>
                  <p className="font-medium">Study Materials</p>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/student/timetable" className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900 dark:to-emerald-900 rounded-xl hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-800 dark:hover:to-emerald-800 transition-all duration-300 flex flex-col items-center group border border-green-200 dark:border-green-800">
                    <motion.div
                      whileHover={{ scale: 1.2, rotateY: 180 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Calendar className="h-8 w-8 text-green-600 dark:text-green-300 mb-2" />
                    </motion.div>
                  <p className="font-medium">Timetable</p>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/student/performance" className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900 rounded-xl hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-800 dark:hover:to-pink-800 transition-all duration-300 flex flex-col items-center group border border-purple-200 dark:border-purple-800">
                    <motion.div
                      whileHover={{ 
                        scale: 1.2,
                        rotate: [0, -10, 10, -10, 0]
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <TrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-300 mb-2" />
                    </motion.div>
                  <p className="font-medium">Performance</p>
                  </Link>
                </motion.div>
                
                <motion.div
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/student/announcements" className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-900 dark:to-yellow-900 rounded-xl hover:from-orange-100 hover:to-yellow-100 dark:hover:from-orange-800 dark:hover:to-yellow-800 transition-all duration-300 flex flex-col items-center group border border-orange-200 dark:border-orange-800">
                    <motion.div
                      whileHover={{ 
                        rotate: [0, -15, 15, -15, 0],
                        scale: 1.2
                      }}
                      transition={{ duration: 0.6 }}
                    >
                      <Bell className="h-8 w-8 text-orange-600 dark:text-orange-300 mb-2" />
                    </motion.div>
                  <p className="font-medium">Announcements</p>
                  </Link>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
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