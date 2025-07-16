'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SubjectManagement from '@/components/subjects/SubjectManagement';
import { getSubjects, Subject } from '@/firebase/subjects';
import { BookOpen, Users, TrendingUp, Calendar, Settings, BarChart3 } from 'lucide-react';

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSubjects: 0,
    activeSubjects: 0,
    totalEnrollments: 0,
    averageCapacityUtilization: 0
  });

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      const subjectsData = await getSubjects(false);
      setSubjects(subjectsData);
      
      const totalEnrollments = subjectsData.reduce((sum, subject) => sum + subject.currentEnrollment, 0);
      const totalCapacity = subjectsData.reduce((sum, subject) => sum + subject.maxCapacity, 0);
      const averageUtilization = totalCapacity > 0 ? (totalEnrollments / totalCapacity) * 100 : 0;
      
      setStats({
        totalSubjects: subjectsData.length,
        activeSubjects: subjectsData.filter(s => s.isActive).length,
        totalEnrollments,
        averageCapacityUtilization: Math.round(averageUtilization)
      });
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject Management</h1>
        <p className="text-gray-600">Manage subjects, enrollments, and capacity planning</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSubjects} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollments</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEnrollments}</div>
            <p className="text-xs text-muted-foreground">
              Across all subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacity Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getUtilizationColor(stats.averageCapacityUtilization)}`}>
              {stats.averageCapacityUtilization}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average across subjects
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subjects</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubjects}</div>
            <p className="text-xs text-muted-foreground">
              Available for enrollment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Manage Subjects
          </TabsTrigger>
          <TabsTrigger value="enrollments" className="flex items-center">
            <Users className="h-4 w-4 mr-2" />
            Enrollments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Subject Overview</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {subjects.map((subject) => {
                    const utilization = (subject.currentEnrollment / subject.maxCapacity) * 100;
                    return (
                      <div key={subject.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <h3 className="font-semibold">{subject.name}</h3>
                          <p className="text-sm text-gray-600">{subject.code} • {subject.faculty}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {subject.currentEnrollment}/{subject.maxCapacity}
                            </p>
                            <p className={`text-xs ${getUtilizationColor(utilization)}`}>
                              {Math.round(utilization)}% full
                            </p>
                          </div>
                          <Badge variant={subject.isActive ? 'default' : 'secondary'}>
                            {subject.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <SubjectManagement />
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollment Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">Enrollment management features coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}