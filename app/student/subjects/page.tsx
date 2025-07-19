'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubjectEnrollmentForm from '@/components/subjects/SubjectEnrollmentForm';
import StudentEnrollmentOverview from '@/components/subjects/StudentEnrollmentOverview';
import { BookOpen, UserPlus, List } from 'lucide-react';

export default function StudentSubjectsPage() {
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