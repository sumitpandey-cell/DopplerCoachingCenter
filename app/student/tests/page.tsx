'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getTestResultsByStudent, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { FileText, Search, Calendar, Award } from 'lucide-react';
import { format } from 'date-fns';

export default function TestResults() {
  const { userProfile } = useAuth();
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredResults, setFilteredResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  useEffect(() => {
    const fetchTestResults = async () => {
      if (!userProfile?.studentId) return;

      try {
        const results = await getTestResultsByStudent(userProfile.studentId);
        setTestResults(results);
        setFilteredResults(results);
      } catch (error) {
        console.error('Error fetching test results:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestResults();
  }, [userProfile]);

  useEffect(() => {
    let filtered = testResults;

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSubject !== 'all') {
      filtered = filtered.filter(result => result.subject === selectedSubject);
    }

    setFilteredResults(filtered);
  }, [testResults, searchTerm, selectedSubject]);

  const subjects = Array.from(new Set(testResults.map(r => r.subject)));

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 80) return 'default';
    if (percentage >= 60) return 'secondary';
    return 'destructive';
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-purple-700 dark:text-purple-300 mb-2 tracking-tight">Test Results</h1>
        <p className="text-gray-600 dark:text-gray-400">View all your test scores and performance</p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tests..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Test Results List */}
      {filteredResults.length > 0 ? (
        <div className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-lg transition-shadow border border-purple-100 dark:border-purple-800 rounded-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <FileText className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{result.testName}</h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center">
                          <Award className="h-4 w-4 mr-1" />
                          {result.subject}
                        </span>
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(result.testDate, 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={getScoreBadgeVariant(result.percentage)} className="text-lg px-3 py-1">
                      {result.percentage}%
                    </Badge>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {result.score} / {result.maxScore} marks
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-purple-300 dark:text-purple-800 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No test results found</h3>
          <p className="text-gray-500 dark:text-gray-400">
            {searchTerm || selectedSubject !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Your test results will appear here once faculty enters your scores'
            }
          </p>
        </div>
      )}
    </div>
  );
}