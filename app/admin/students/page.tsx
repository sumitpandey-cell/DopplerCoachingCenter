'use client';

import React, { useEffect, useState } from 'react';
import { getAllTestResults, getInquiries, TestResult, StudentInquiry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Award, BookOpen } from 'lucide-react';
import { format } from 'date-fns';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  course: string;
  batch: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'graduated';
  totalTests: number;
  averageScore: number;
}

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    course: '',
    batch: '',
    status: 'active' as const,
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const [testResults, inquiries] = await Promise.all([
          getAllTestResults(),
          getInquiries(),
        ]);

        // Create students from test results and inquiries
        const studentMap = new Map<string, Student>();

        // Add students from test results
        testResults.forEach(result => {
          if (!studentMap.has(result.studentId)) {
            studentMap.set(result.studentId, {
              id: result.studentId,
              name: result.studentName,
              email: `${result.studentId}@student.com`,
              phone: '+91 98765 43210',
              studentId: result.studentId,
              course: result.subject,
              batch: 'Morning',
              joinDate: new Date(2024, 0, 1),
              status: 'active',
              totalTests: 0,
              averageScore: 0,
            });
          }
        });

        // Calculate test statistics
        const studentStats = testResults.reduce((acc, result) => {
          if (!acc[result.studentId]) {
            acc[result.studentId] = { total: 0, count: 0 };
          }
          acc[result.studentId].total += result.percentage;
          acc[result.studentId].count += 1;
          return acc;
        }, {} as Record<string, { total: number; count: number }>);

        // Update students with test stats
        studentMap.forEach((student, id) => {
          if (studentStats[id]) {
            student.totalTests = studentStats[id].count;
            student.averageScore = Math.round(studentStats[id].total / studentStats[id].count);
          }
        });

        // Add students from admitted inquiries
        inquiries
          .filter(inquiry => inquiry.status === 'admitted')
          .forEach(inquiry => {
            const studentId = `STU${Date.now()}${Math.random().toString(36).substr(2, 3)}`;
            if (!Array.from(studentMap.values()).some(s => s.email === inquiry.email)) {
              studentMap.set(studentId, {
                id: studentId,
                name: inquiry.fullName,
                email: inquiry.email,
                phone: inquiry.phone,
                studentId,
                course: inquiry.interestedCourses,
                batch: inquiry.preferredBatch || 'Morning',
                joinDate: inquiry.submittedAt,
                status: 'active',
                totalTests: 0,
                averageScore: 0,
              });
            }
          });

        const studentsArray = Array.from(studentMap.values());
        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(student => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter]);

  const handleAddStudent = () => {
    const student: Student = {
      id: `STU${Date.now()}`,
      ...newStudent,
      joinDate: new Date(),
      totalTests: 0,
      averageScore: 0,
    };

    setStudents(prev => [...prev, student]);
    setNewStudent({
      name: '',
      email: '',
      phone: '',
      studentId: '',
      course: '',
      batch: '',
      status: 'active',
    });
    setShowAddModal(false);
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const handleUpdateStudent = () => {
    if (!editingStudent) return;

    setStudents(prev =>
      prev.map(s => s.id === editingStudent.id ? editingStudent : s)
    );
    setEditingStudent(null);
  };

  const handleDeleteStudent = (studentId: string) => {
    if (confirm('Are you sure you want to delete this student?')) {
      setStudents(prev => prev.filter(s => s.id !== studentId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'graduated':
        return <Badge variant="outline">Graduated</Badge>;
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Management</h1>
            <p className="text-gray-600">Manage student records and information</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Enter student information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newStudent.email}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newStudent.phone}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    value={newStudent.studentId}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, studentId: e.target.value }))}
                    placeholder="Enter student ID"
                  />
                </div>
                <div>
                  <Label htmlFor="course">Course</Label>
                  <select
                    id="course"
                    value={newStudent.course}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, course: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Course</option>
                    <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                    <option value="NEET">NEET</option>
                    <option value="Class 11th Science">Class 11th Science</option>
                    <option value="Class 12th Science">Class 12th Science</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="batch">Batch</Label>
                  <select
                    id="batch"
                    value={newStudent.batch}
                    onChange={(e) => setNewStudent(prev => ({ ...prev, batch: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Batch</option>
                    <option value="Morning">Morning</option>
                    <option value="Afternoon">Afternoon</option>
                    <option value="Evening">Evening</option>
                  </select>
                </div>
                <Button onClick={handleAddStudent} className="w-full">
                  Add Student
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
            placeholder="Search students..."
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
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="graduated">Graduated</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{students.filter(s => s.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Graduated</p>
                <p className="text-2xl font-bold">{students.filter(s => s.status === 'graduated').length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)
                    : 0}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription>ID: {student.studentId}</CardDescription>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{student.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{student.course}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Joined: {format(student.joinDate, 'MMM dd, yyyy')}</span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Tests: {student.totalTests}</span>
                      <span>Avg: {student.averageScore}%</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditStudent(student)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteStudent(student.id)}
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
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first student to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <Dialog open={!!editingStudent} onOpenChange={() => setEditingStudent(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingStudent.email}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingStudent.phone}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-course">Course</Label>
                <select
                  id="edit-course"
                  value={editingStudent.course}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, course: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                  <option value="NEET">NEET</option>
                  <option value="Class 11th Science">Class 11th Science</option>
                  <option value="Class 12th Science">Class 12th Science</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editingStudent.status}
                  onChange={(e) => setEditingStudent(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="graduated">Graduated</option>
                </select>
              </div>
              <Button onClick={handleUpdateStudent} className="w-full">
                Update Student
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}