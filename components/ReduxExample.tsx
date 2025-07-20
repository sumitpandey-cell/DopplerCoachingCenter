'use client';

import { useEffect } from 'react';
import { useStudents, useSubjects, useDashboard } from '@/hooks/use-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function ReduxExample() {
  const students = useStudents();
  const subjects = useSubjects();
  const dashboard = useDashboard();

  // Fetch data on component mount
  useEffect(() => {
    students.refetch();
    subjects.refetch();
    dashboard.refetch();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Redux State Management Example</h2>
        <div className="space-x-2">
          <Button onClick={students.refetch} disabled={students.status === 'loading'}>
            Refresh Students
          </Button>
          <Button onClick={subjects.refetch} disabled={subjects.status === 'loading'}>
            Refresh Subjects
          </Button>
          <Button onClick={dashboard.refetch} disabled={dashboard.status === 'loading'}>
            Refresh Dashboard
          </Button>
        </div>
      </div>

      {/* Students Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Students
            <Badge variant={students.status === 'loading' ? 'secondary' : 'default'}>
              {students.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {students.status === 'loading' && <p>Loading students...</p>}
          {students.status === 'failed' && (
            <p className="text-red-500">Error: {students.error}</p>
          )}
          {students.status === 'succeeded' && (
            <div className="space-y-2">
              <p>Total Students: {students.data.length}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {students.data.slice(0, 3).map((student) => (
                  <div key={student.id} className="p-3 border rounded">
                    <p className="font-semibold">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                    <p className="text-xs">ID: {student.studentId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Subjects
            <Badge variant={subjects.status === 'loading' ? 'secondary' : 'default'}>
              {subjects.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subjects.status === 'loading' && <p>Loading subjects...</p>}
          {subjects.status === 'failed' && (
            <p className="text-red-500">Error: {subjects.error}</p>
          )}
          {subjects.status === 'succeeded' && (
            <div className="space-y-2">
              <p>Total Subjects: {subjects.data.length}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjects.data.map((subject) => (
                  <div key={subject.id} className="p-3 border rounded">
                    <p className="font-semibold">{subject.name}</p>
                    {subject.code && <p className="text-sm text-gray-600">Code: {subject.code}</p>}
                    {subject.monthlyFeeAmount && (
                      <p className="text-sm text-green-600">Fee: ₹{subject.monthlyFeeAmount}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Dashboard Stats
            <Badge variant={dashboard.status === 'loading' ? 'secondary' : 'default'}>
              {dashboard.status}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dashboard.status === 'loading' && <p>Loading dashboard stats...</p>}
          {dashboard.status === 'failed' && (
            <p className="text-red-500">Error: {dashboard.error}</p>
          )}
          {dashboard.status === 'succeeded' && dashboard.stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold text-blue-600">{dashboard.stats.students}</p>
                <p className="text-sm text-gray-600">Students</p>
              </div>
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold text-green-600">{dashboard.stats.faculty}</p>
                <p className="text-sm text-gray-600">Faculty</p>
              </div>
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold text-purple-600">₹{dashboard.stats.revenue}</p>
                <p className="text-sm text-gray-600">Revenue</p>
              </div>
              <div className="p-4 border rounded text-center">
                <p className="text-2xl font-bold text-orange-600">{dashboard.stats.pendingInquiries}</p>
                <p className="text-sm text-gray-600">Inquiries</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 