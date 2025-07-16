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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Subject Enrollment</h1>
        <p className="text-gray-600">Manage your subject enrollments and view your academic schedule</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center">
            <List className="h-4 w-4 mr-2" />
            My Enrollments
          </TabsTrigger>
          <TabsTrigger value="enroll" className="flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            Enroll in Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" key={`overview-${refreshKey}`}>
          <StudentEnrollmentOverview />
        </TabsContent>

        <TabsContent value="enroll">
          <SubjectEnrollmentForm 
            maxEnrollmentLimit={6}
            onEnrollmentComplete={handleEnrollmentComplete}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}