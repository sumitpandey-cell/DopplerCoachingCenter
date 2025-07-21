'use client';

import React, { useEffect, useState } from 'react';
import { getAnnouncements, Announcement } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../store';
import type { RootState } from '../../store';
import { useAuth } from '@/contexts/AuthContext';

export default function Announcements() {
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

  const announcements: any[] = student?.announcements || [];

  useEffect(() => {
    setIsDataLoading(studentStatus === 'loading');
  }, [studentStatus, setIsDataLoading]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-500" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High Priority</Badge>;
      case 'medium':
        return <Badge variant="secondary">Medium Priority</Badge>;
      default:
        return <Badge variant="outline">Low Priority</Badge>;
    }
  };

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">Announcements</h1>
      {announcements.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">No announcements found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {announcements.map((a: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-200 dark:border-gray-800">
              <div className="font-semibold text-lg mb-2">{a.title || 'Announcement'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{a.content || ''}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{a.date ? new Date(a.date.seconds ? a.date.seconds * 1000 : a.date).toLocaleDateString() : 'N/A'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}