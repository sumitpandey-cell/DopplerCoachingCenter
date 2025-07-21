'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import SubjectManagement from '@/components/subjects/SubjectManagement';
import { useSubjects } from '@/hooks/use-redux';
import { BookOpen, Users, TrendingUp, Calendar, Settings, BarChart3, RefreshCw } from 'lucide-react';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export default function AdminSubjectsPage() {
  const subjects = useSubjects();
  const { setIsDataLoading } = useDataLoading();

  useEffect(() => {
    subjects.refetch();
  }, []);

  // Set isDataLoading only for subjects list (critical)
  useEffect(() => {
    setIsDataLoading(subjects.status === 'loading');
  }, [subjects.status, setIsDataLoading]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 90) return 'text-red-600';
    if (utilization >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (subjects.status === 'failed') {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 p-8">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{subjects.error || 'Failed to load subjects.'}</p>
            <Button onClick={subjects.refetch} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
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
                {subjects.status === 'loading' ? (
                  <div className="animate-pulse space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="h-20 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                ) : !subjects.data || subjects.data.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No subjects found.</p>
                    <Button onClick={subjects.refetch} className="mt-4" variant="outline">
                      Refresh
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subjects.data.map((subject) => {
                      const utilization = subject.maxCapacity
                        ? (subject.currentEnrollment / subject.maxCapacity) * 100
                        : 0;
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