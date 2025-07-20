'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import SubjectManagement from '@/components/subjects/SubjectManagement';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchSubjects } from '../../store';
import { getSubjects, Subject } from '@/firebase/subjects';
import { BookOpen, Users, TrendingUp, Calendar, Settings, BarChart3 } from 'lucide-react';

export default function AdminSubjectsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const subjectsState = useSelector((state: RootState) => state.subjects);
  const { data: subjects, status: subjectsStatus, error: subjectsError } = subjectsState;

  useEffect(() => {
    if (subjectsStatus === 'idle') {
      dispatch(fetchSubjects());
    }
  }, [dispatch, subjectsStatus]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  // Simple skeleton for subjects list
  function SubjectsSkeleton() {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (subjectsStatus === 'loading') {
    // Only show a minimal spinner while checking auth (if needed)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (subjectsStatus === 'failed') {
    return <div className="text-center py-8 text-red-600">{subjectsError || 'Failed to load subjects.'}</div>;
  }

  if (!subjects || subjects.length === 0) {
    return <div className="text-center py-8 text-gray-500">No subjects found.</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Subjects</h1>
        {subjectsStatus === 'loading' ? <SubjectsSkeleton /> : (
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

        <Tabs defaultValue="overview" className="space-y-6 mt-8">
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
                {subjectsStatus === 'loading' ? (
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
    </div>
  );
}