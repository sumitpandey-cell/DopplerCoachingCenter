'use client';

import React, { useEffect, useState } from 'react';
import { getAllTestResults, getAllTests, addTest, updateTest, deleteTest, TestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FileText, Search, Plus, Edit, Trash2, Calendar, User, Award, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useSubjects } from '@/contexts/SubjectsContext';

interface Test {
  id: string;
  name: string;
  subject: string;
  maxScore: number;
  duration: number;
  scheduledDate: Date;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  studentsEnrolled: number;
  averageScore: number;
  createdBy: string;
}

export default function AdminTests() {
  const { subjects, loading: subjectsLoading } = useSubjects();
  const [tests, setTests] = useState<Test[]>([]);

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [filteredTests, setFilteredTests] = useState<Test[]>(tests);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);

  const [newTest, setNewTest] = useState({
    name: '',
    subjectId: '',
    maxScore: 100,
    duration: 60,
    scheduledDate: '',
    status: 'scheduled' as const,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allTests, results] = await Promise.all([
          getAllTests(),
          getAllTestResults(),
        ]);
        setTestResults(results);
        // Update test statistics based on results
        const updatedTests = allTests.map((test: any) => {
          const testResults = results.filter(r => r.testName === test.name);
          const averageScore = testResults.length > 0 
            ? testResults.reduce((sum, r) => sum + r.percentage, 0) / testResults.length
            : 0;
          return {
            ...test,
            studentsEnrolled: testResults.length,
            averageScore: Math.round(averageScore),
          };
        });
        setTests(updatedTests);
        setFilteredTests(updatedTests);
      } catch (error) {
        console.error('Error fetching test data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = tests;

    if (searchTerm) {
      filtered = filtered.filter(test => {
        const subject = subjects.find(s => s.id === test.subjectId);
        const subjectName = subject ? subject.name : '';
        return (
          (test.name && test.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (subjectName && subjectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (test.createdBy && test.createdBy.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(test => test.status === statusFilter);
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(test => test.subjectId === subjectFilter);
    }

    setFilteredTests(filtered);
  }, [tests, searchTerm, statusFilter, subjectFilter]);

  const handleAddTest = async () => {
    const test = {
      ...newTest,
      studentsEnrolled: 0,
      averageScore: 0,
      createdBy: 'Admin',
    };
    await addTest(test);
    setNewTest({
      name: '',
      subjectId: '',
      maxScore: 100,
      duration: 60,
      scheduledDate: '',
      status: 'scheduled',
    });
    setShowAddModal(false);
    // Refresh tests
    const allTests = await getAllTests();
    setTests(allTests);
    setFilteredTests(allTests);
  };
  editingTest
  const handleEditTest = (test: Test) => {
    setEditingTest(test);
  };

  const handleUpdateTest = async () => {
    if (!editingTest) return;
    const { id, ...updates } = editingTest;
    await updateTest(id, updates);
    setEditingTest(null);
    // Refresh tests
    const allTests = await getAllTests();
    setTests(allTests);
    setFilteredTests(allTests);
  };

  const handleDeleteTest = async (testId: string) => {
    if (confirm('Are you sure you want to delete this test?')) {
      await deleteTest(testId);
      // Refresh tests
      const allTests = await getAllTests();
      setTests(allTests);
      setFilteredTests(allTests);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'scheduled':
        return <Badge variant="outline">Scheduled</Badge>;
      case 'ongoing':
        return <Badge variant="default">Ongoing</Badge>;
      case 'completed':
        return <Badge variant="secondary">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Test Management</h1>
            <p className="text-gray-600">Create and manage tests and assessments</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Test</DialogTitle>
                <DialogDescription>Set up a new test or assessment</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Test Name</Label>
                  <Input
                    id="name"
                    value={newTest.name}
                    onChange={(e) => setNewTest(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter test name"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={newTest.subjectId}
                    onChange={e => setNewTest(prev => ({ ...prev, subjectId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    disabled={subjectsLoading}
                  >
                    <option value="">{subjectsLoading ? 'Loading subjects...' : 'Select Subject'}</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>{subject.name}</option>
                    ))}
                  </select>
                </div>
                {(!subjectsLoading && subjects.length === 0) && (
                  <div className="text-sm text-red-500 mt-1">No subjects found. Please add subjects first.</div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      value={newTest.maxScore}
                      onChange={(e) => setNewTest(prev => ({ ...prev, maxScore: parseInt(e.target.value) || 100 }))}
                      placeholder="100"
                    />
                  </div>
                  <div>
                    <Label htmlFor="duration">Duration (minutes)</Label>
                    <Input
                      id="duration"
                      type="number"
                      value={newTest.duration}
                      onChange={(e) => setNewTest(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                      placeholder="60"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={newTest.scheduledDate}
                    onChange={(e) => setNewTest(prev => ({ ...prev, scheduledDate: e.target.value }))}
                  />
                </div>
                <Button onClick={handleAddTest} className="w-full">
                  Create Test
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
          disabled={subjectsLoading}
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'scheduled').length}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Score</p>
                <p className="text-2xl font-bold">
                  {tests.filter(t => t.status === 'completed').length > 0 
                    ? Math.round(tests.filter(t => t.status === 'completed').reduce((sum, t) => sum + t.averageScore, 0) / tests.filter(t => t.status === 'completed').length)
                    : 0}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tests Grid */}
      {filteredTests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTests.map((test) => (
            <Card key={test.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{test.name}</CardTitle>
                    <CardDescription>{test.subject}</CardDescription>
                  </div>
                  {getStatusBadge(test.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <User className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Created by: {test.createdBy}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{format(test.scheduledDate, 'MMM dd, yyyy • h:mm a')}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Max Score: {test.maxScore} • Duration: {test.duration}m</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Students: {test.studentsEnrolled}</span>
                      {test.status === 'completed' && (
                        <span>Avg: {test.averageScore}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditTest(test)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteTest(test.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' || subjectFilter !== 'all'
              ? 'Try adjusting your search or filter criteria'
              : 'Create your first test to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Test Modal */}
      {editingTest && (
        <Dialog open={!!editingTest} onOpenChange={() => setEditingTest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Test</DialogTitle>
              <DialogDescription>Update test information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Test Name</Label>
                <Input
                  id="edit-name"
                  value={editingTest.name}
                  onChange={(e) => setEditingTest(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <select
                  id="edit-subject"
                  value={editingTest.subject}
                  onChange={e => setEditingTest(prev => prev ? { ...prev, subjectId: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  disabled={subjectsLoading}
                >
                  <option value="">{subjectsLoading ? 'Loading subjects...' : 'Select Subject'}</option>
                  {subjects.map(subject => (
                    <option key={subject.id} value={subject.id}>{subject.name}</option>
                  ))}
                </select>
                {(!subjectsLoading && subjects.length === 0) && (
                  <div className="text-sm text-red-500 mt-1">No subjects found. Please add subjects first.</div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-maxScore">Maximum Score</Label>
                  <Input
                    id="edit-maxScore"
                    type="number"
                    value={editingTest.maxScore}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, maxScore: parseInt(e.target.value) || 100 } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-duration">Duration (minutes)</Label>
                  <Input
                    id="edit-duration"
                    type="number"
                    value={editingTest.duration}
                    onChange={(e) => setEditingTest(prev => prev ? { ...prev, duration: parseInt(e.target.value) || 60 } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editingTest.status}
                  onChange={(e) => setEditingTest(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <Button onClick={handleUpdateTest} className="w-full">
                Update Test
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}