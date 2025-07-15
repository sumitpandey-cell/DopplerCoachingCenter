'use client';

import React, { useEffect, useState } from 'react';
import { getAllTestResults, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Users, Search, TrendingUp, Award } from 'lucide-react';

interface StudentStats {
  studentId: string;
  studentName: string;
  totalTests: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  subjects: string[];
}

export default function Students() {
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const testResults = await getAllTestResults();
        
        // Group results by student
        const studentMap = testResults.reduce((acc, result) => {
          if (!acc[result.studentId]) {
            acc[result.studentId] = {
              studentId: result.studentId,
              studentName: result.studentName,
              results: [],
            };
          }
          acc[result.studentId].results.push(result);
          return acc;
        }, {} as Record<string, { studentId: string; studentName: string; results: TestResult[] }>);

        // Calculate stats for each student
        const studentStats: StudentStats[] = Object.values(studentMap).map(student => {
          const scores = student.results.map(r => r.percentage);
          const subjects = Array.from(new Set(student.results.map(r => r.subject)));
          
          return {
            studentId: student.studentId,
            studentName: student.studentName,
            totalTests: student.results.length,
            averageScore: scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : 0,
            highestScore: scores.length > 0 ? Math.max(...scores) : 0,
            lowestScore: scores.length > 0 ? Math.min(...scores) : 0,
            subjects,
          };
        });

        setStudents(studentStats);
        setFilteredStudents(studentStats);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [students, searchTerm]);

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    return <Badge className="bg-red-100 text-red-800">Needs Improvement</Badge>;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Students Overview</h1>
        <p className="text-gray-600">Monitor student performance and progress</p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.studentId} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="h-8 w-8 text-blue-600" />
                  {getPerformanceBadge(student.averageScore)}
                </div>
                <CardTitle className="text-lg">{student.studentName}</CardTitle>
                <CardDescription>ID: {student.studentId}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Tests: {student.totalTests}</span>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-2 text-gray-500" />
                      <span>Avg: {student.averageScore}%</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 mb-1">Performance Range:</p>
                    <div className="flex justify-between">
                      <span className="text-green-600">High: {student.highestScore}%</span>
                      <span className="text-red-600">Low: {student.lowestScore}%</span>
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-gray-600 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {student.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Student data will appear here once test results are entered'
            }
          </p>
        </div>
      )}
    </div>
  );
}