'use client';

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubjectEnrollmentForm from '@/components/subjects/SubjectEnrollmentForm';
import StudentEnrollmentOverview from '@/components/subjects/StudentEnrollmentOverview';
import { BookOpen, UserPlus, List } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../store';
import type { RootState } from '../../store';
import { useAuth } from '@/contexts/AuthContext';

export default function StudentSubjectsPage() {
  const { userProfile } = useAuth();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  const subjects = student?.subjects || [];
  const enrollments = student?.enrollments || [];

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!subjects.length && !enrollments.length) {
    return <div className="p-8 text-gray-500 dark:text-gray-400">No subject enrollment data found.</div>;
  }

  const [activeTab, setActiveTab] = useState('overview');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEnrollmentComplete = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('overview');
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mb-2 tracking-tight">Subject Enrollment</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your subject enrollments and view your academic schedule</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-blue-50 dark:bg-blue-900 rounded-lg mb-4">
          <TabsTrigger value="overview" className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition">
            <List className="h-4 w-4 mr-2" />
            My Enrollments
          </TabsTrigger>
          <TabsTrigger value="enroll" className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg transition">
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll in Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" key={`overview-${refreshKey}`}> 
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <StudentEnrollmentOverview />
          </div>
        </TabsContent>

        <TabsContent value="enroll">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6">
            <SubjectEnrollmentForm 
              maxEnrollmentLimit={6}
              onEnrollmentComplete={handleEnrollmentComplete}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}