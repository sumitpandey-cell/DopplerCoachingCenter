'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../store';
import type { RootState } from '../../store';

export default function StudentTestsPage() {
  const { userProfile } = useAuth();
  const { setIsDataLoading } = useDataLoading();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  const testResults: any[] = student?.testResults || [];

  useEffect(() => {
    setIsDataLoading(studentStatus === 'loading');
  }, [studentStatus, setIsDataLoading]);

  // Filtered results
  const filteredResults = testResults.filter((result: any) => {
    let match = true;
    if (searchTerm) {
      match = result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              result.subject.toLowerCase().includes(searchTerm.toLowerCase());
    }
    if (selectedSubject !== 'all') {
      match = match && result.subject === selectedSubject;
    }
    return match;
  });

  const subjects = Array.from(new Set(testResults.map((r: any) => r.subject)));

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i: number) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">My Test Results</h1>
      {testResults.length === 0 ? (
        <div className="text-gray-500 dark:text-gray-400">No test results found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testResults.map((test: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-lg">{test.testName || 'Test'}</div>
                <span className={`px-2 py-1 rounded text-xs font-bold ${test.percentage >= 80 ? 'bg-green-100 text-green-700' : test.percentage >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>{test.percentage}%</span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subject: {test.subject || 'N/A'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Date: {test.date ? new Date(test.date.seconds ? test.date.seconds * 1000 : test.date).toLocaleDateString() : 'N/A'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Score: {test.score || '-'} / {test.totalMarks || '-'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Remarks: {test.remarks || '-'}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}