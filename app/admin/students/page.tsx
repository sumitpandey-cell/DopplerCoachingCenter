'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { addStudent, updateStudent, deleteStudent, restoreStudent, activateStudent } from '@/firebase/firestore';
import { getSubjects, Subject } from '@/firebase/firestore';
import { enrollStudentInSubjects } from '@/firebase/subjects';
import { useStudents, useSubjects } from '@/hooks/use-redux';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Award, BookOpen, RefreshCw } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Loader, Skeleton } from '@/components/ui/loader';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  studentId: string;
  course: string;
  batch: string;
  joinDate: Date;
  status: 'active' | 'inactive' ;
  totalTests: number;
  averageScore: number;
  subjects: string[]; // Add subjects field
}

// Color palette for avatars
const avatarColors = [
  'bg-gradient-to-br from-blue-400 to-indigo-500',
  'bg-gradient-to-br from-green-400 to-emerald-500',
  'bg-gradient-to-br from-purple-400 to-pink-500',
  'bg-gradient-to-br from-yellow-400 to-orange-500',
  'bg-gradient-to-br from-teal-400 to-cyan-500',
];

// Simple skeleton for students table
function StudentsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(8)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
      ))}
    </div>
  );
}

export default function AdminStudents() {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [inactiveStudents, setInactiveStudents] = useState<Student[]>([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [activateLoading, setActivateLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 20;
  const totalPages = Math.ceil(filteredStudents.length / PAGE_SIZE);
  const paginatedStudents = filteredStudents.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // Redux hooks
  const students = useStudents();
  const subjects = useSubjects();
  const { setIsDataLoading, triggerRefresh } = useDataLoading();

  // In newStudent state, remove 'courses' and only keep 'subjects' and 'batches'
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    status: 'active' as const,
    subjects: [] as string[],
  });

  // Fetch data on component mount
  useEffect(() => {
    students.refetch();
    subjects.refetch();
  }, []);

  // Set isDataLoading only for students list (critical)
  useEffect(() => {
    setIsDataLoading(students.status === 'loading');
  }, [students.status, setIsDataLoading]);

  useEffect(() => {
    let filtered = students.data || [];

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

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(student => Array.isArray(student.subjects) && student.subjects.includes(subjectFilter));
    }

    setFilteredStudents(filtered);
  }, [students.data, searchTerm, statusFilter, subjectFilter]);

  const handleAddStudent = async () => {
    setAddLoading(true);
    try {
      const student = {
        ...newStudent,
        fullName: newStudent.name, // Use name as fullName
        courses: [], // Placeholder, update as needed
        password: '', // Placeholder, update as needed
        role: 'student' as const,
        enquiryId: '', // Placeholder, update as needed
        studentId: newStudent.studentId || `STU${Date.now()}`,
        createdAt: new Date(),
        isActive: true,
        hasSignedUp: false,
      };
      await addStudent(student);
      // Enroll student in selected subjects and create studentFees
      if (student.subjects && student.subjects.length > 0) {
        await enrollStudentInSubjects(student.studentId, student.subjects);
      }
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        status: 'active',
        subjects: [],
      });
      setShowAddModal(false);
      // Refresh students data
      students.refetch();
      // Also refresh inactive students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const inactiveArray = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentId: data.studentId || '',
          course: data.course || '',
          batch: data.batch || '',
          joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
          status: data.status || 'active',
          totalTests: data.totalTests || 0,
          averageScore: data.averageScore || 0,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        } as Student;
      }).filter((s: any) => s.status === 'inactive');
      setInactiveStudents(inactiveArray);
    } catch (error) {
      console.error('Error adding student:', error);
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent({ ...student, subjects: student.subjects || [] });
  };

  const handleUpdateStudent = async () => {
    setEditLoading(true);
    if (!editingStudent) return;
    const { studentId, ...updates } = editingStudent;
    try {
      await updateStudent(studentId, updates);
      setEditingStudent(null);
      // Refresh students data
      students.refetch();
      // Also refresh inactive students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const inactiveArray = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentId: data.studentId || '',
          course: data.course || '',
          batch: data.batch || '',
          joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
          status: data.status || 'active',
          totalTests: data.totalTests || 0,
          averageScore: data.averageScore || 0,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        } as Student;
      }).filter((s: any) => s.status === 'inactive');
      setInactiveStudents(inactiveArray);
    } catch (error) {
      console.error('Error updating student:', error);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    setDeleteLoading(true);
    try {
      await deleteStudent(studentId);
      // Refresh students data
      students.refetch();
      triggerRefresh();
      // Also refresh inactive students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const inactiveArray = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentId: data.studentId || '',
          course: data.course || '',
          batch: data.batch || '',
          joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
          status: data.status || 'active',
          totalTests: data.totalTests || 0,
          averageScore: data.averageScore || 0,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        } as Student;
      }).filter((s: any) => s.status === 'inactive');
      setInactiveStudents(inactiveArray);
    } catch (error) {
      console.error('Error deleting student:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleRestoreStudent = async (studentId: string) => {
    setRestoreLoading(true);
    try {
      await restoreStudent(studentId);
      // Refresh students data
      students.refetch();
      // Also refresh inactive students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const inactiveArray = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentId: data.studentId || '',
          course: data.course || '',
          batch: data.batch || '',
          joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
          status: data.status || 'active',
          totalTests: data.totalTests || 0,
          averageScore: data.averageScore || 0,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        } as Student;
      }).filter((s: any) => s.status === 'inactive');
      setInactiveStudents(inactiveArray);
    } catch (error) {
      console.error('Error restoring student:', error);
    } finally {
      setRestoreLoading(false);
    }
  };

  const handleActivateStudent = async (studentId: string) => {
    setActivateLoading(true);
    try {
      await activateStudent(studentId);
      // Refresh students data
      students.refetch();
      triggerRefresh();
      // Also refresh inactive students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const inactiveArray = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.fullName || data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          studentId: data.studentId || '',
          course: data.course || '',
          batch: data.batch || '',
          joinDate: data.createdAt && typeof data.createdAt.toDate === 'function' ? data.createdAt.toDate() : data.createdAt || new Date(),
          status: data.status || 'active',
          totalTests: data.totalTests || 0,
          averageScore: data.averageScore || 0,
          subjects: Array.isArray(data.subjects) ? data.subjects : [],
        } as Student;
      }).filter((s: any) => s.status === 'inactive');
      setInactiveStudents(inactiveArray);
    } catch (error) {
      console.error('Error activating student:', error);
    } finally {
      setActivateLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-red-100 text-red-800">Inactive</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Unknown</Badge>;
    }
  };

  const isLoading = students.status === 'loading' || subjects.status === 'loading';

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Students Management</h1>
              <p className="text-gray-600 mt-2">Manage all student accounts and enrollments</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant={students.status === 'loading' ? 'secondary' : 'default'}>
                {students.status}
              </Badge>
              <Button 
                onClick={() => {
                  students.refetch();
                  subjects.refetch();
                }}
                disabled={isLoading}
                size="sm"
                variant="outline"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Error Handling */}
        {students.status === 'failed' && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <Users className="h-4 w-4" />
                <p>Failed to load students: {students.error}</p>
                <Button onClick={students.refetch} size="sm" variant="outline">
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                <select
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Subjects</option>
                  {subjects.data?.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Students ({filteredStudents.length})</CardTitle>
                <CardDescription>
                  {students.status === 'succeeded' && `${students.data.length} total students`}
                </CardDescription>
              </div>
              <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Student
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Student</DialogTitle>
                    <DialogDescription>
                      Create a new student account with basic information.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="email" className="text-right">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={newStudent.email}
                        onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="phone" className="text-right">
                        Phone
                      </Label>
                      <Input
                        id="phone"
                        value={newStudent.phone}
                        onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="studentId" className="text-right">
                        Student ID
                      </Label>
                      <Input
                        id="studentId"
                        value={newStudent.studentId}
                        onChange={(e) => setNewStudent({ ...newStudent, studentId: e.target.value })}
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="subjects" className="text-right">
                        Subjects
                      </Label>
                      <div className="col-span-3">
                        <div className="flex flex-wrap gap-2">
                          {subjects.data?.map((subject) => (
                            <label key={subject.id} className="flex items-center space-x-2 bg-gray-50 px-2 py-1 rounded border border-gray-200">
                              <input
                                type="checkbox"
                                value={subject.id}
                                checked={newStudent.subjects.includes(subject.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setNewStudent({
                                      ...newStudent,
                                      subjects: [...newStudent.subjects, subject.id],
                                    });
                                  } else {
                                    setNewStudent({
                                      ...newStudent,
                                      subjects: newStudent.subjects.filter((id) => id !== subject.id),
                                    });
                                  }
                                }}
                                className="accent-blue-600"
                              />
                              <span>{subject.name}</span>
                            </label>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 mt-1 block">Select one or more subjects.</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setShowAddModal(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddStudent} disabled={addLoading}>
                      {addLoading ? 'Adding...' : 'Add Student'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <StudentsSkeleton />
            ) : (
              <div className="space-y-4">
                {paginatedStudents.map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${avatarColors[Math.abs(student.name.length) % avatarColors.length]}`}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <p className="text-xs text-gray-500">ID: {student.studentId}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {getStatusBadge(student.status)}
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditStudent(student)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Student</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteStudent(student.studentId)}
                                disabled={deleteLoading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Delete Student</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        {student.status === 'inactive' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleActivateStudent(student.studentId)}
                                  disabled={activateLoading}
                                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                >
                                  <Users className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Activate Student</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}