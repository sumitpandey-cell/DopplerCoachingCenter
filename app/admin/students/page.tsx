'use client';

import React, { useEffect, useState } from 'react';
import { getDocs, collection } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { addStudent, updateStudent, deleteStudent, restoreStudent } from '@/firebase/firestore';
import { getSubjects, Subject } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Users, Search, Plus, Edit, Trash2, Mail, Phone, Calendar, Award, BookOpen } from 'lucide-react';
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
  status: 'active' | 'inactive' | 'graduated';
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

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [inactiveStudents, setInactiveStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [addLoading, setAddLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);

  // In newStudent state, remove 'courses' and only keep 'subjects' and 'batches'
  const [newStudent, setNewStudent] = useState({
    name: '',
    email: '',
    phone: '',
    studentId: '',
    status: 'active' as const,
    subjects: [] as string[],
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const snap = await getDocs(collection(db, 'studentAccounts'));
        const studentsArray = snap.docs.map(doc => {
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
        }).filter((s: any) => s.status !== 'inactive');
        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
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
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchSubjects();
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

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(student => Array.isArray(student.subjects) && student.subjects.includes(subjectFilter));
    }

    setFilteredStudents(filtered);
  }, [students, searchTerm, statusFilter, subjectFilter]);

  const handleAddStudent = async () => {
    setAddLoading(true);
    try {
      const student = {
        ...newStudent,
        fullName: newStudent.name, // Use name as fullName
        courses: [], // Placeholder, update as needed
        password: '', // Placeholder, update as needed
        role: 'student',
        enquiryId: '', // Placeholder, update as needed
        studentId: newStudent.studentId || `STU${Date.now()}`,
        createdAt: new Date(),
        isActive: true,
        hasSignedUp: false,
      };
      await addStudent(student);
      setNewStudent({
        name: '',
        email: '',
        phone: '',
        studentId: '',
        status: 'active',
        subjects: [],
      });
      setShowAddModal(false);
      // Refresh students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const studentsArray = snap.docs.map(doc => {
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
      }).filter((s: any) => s.status !== 'inactive');
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
      // Also refresh inactive students
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
      // Refresh students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const studentsArray = snap.docs.map(doc => {
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
      }).filter((s: any) => s.status !== 'inactive');
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
      // Also refresh inactive students
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
    if (confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
        // Refresh students
        const snap = await getDocs(collection(db, 'studentAccounts'));
        const studentsArray = snap.docs.map(doc => {
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
        }).filter((s: any) => s.status !== 'inactive');
        setStudents(studentsArray);
        setFilteredStudents(studentsArray);
        // Also refresh inactive students
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
    }
  };

  const handleRestoreStudent = async (studentId: string) => {
    setRestoreLoading(true);
    try {
      await restoreStudent(studentId);
      // Refresh students
      const snap = await getDocs(collection(db, 'studentAccounts'));
      const studentsArray = snap.docs.map(doc => {
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
      }).filter((s: any) => s.status !== 'inactive');
      setStudents(studentsArray);
      setFilteredStudents(studentsArray);
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
        <div className="space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
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
                  <Label>Subjects</Label>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map(subject => (
                      <label key={subject.id} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newStudent.subjects.includes(subject.name)}
                          onChange={e => setNewStudent(prev => ({
                            ...prev,
                            subjects: e.target.checked
                              ? [...prev.subjects, subject.name]
                              : prev.subjects.filter(s => s !== subject.name)
                          }))}
                        />
                        {subject.name}
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddStudent} className="w-full" disabled={addLoading}>
                  {addLoading ? <Loader size={20} className="mx-auto" /> : 'Add Student'}
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
            className="pl-10 rounded-full border-blue-200 focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-full border-0 bg-blue-50 text-blue-700 font-semibold shadow-sm focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="graduated">Graduated</option>
          </select>
          <select
            value={subjectFilter}
            onChange={e => setSubjectFilter(e.target.value)}
            className="px-4 py-2 rounded-full border-0 bg-purple-50 text-purple-700 font-semibold shadow-sm focus:ring-2 focus:ring-purple-400"
          >
            <option value="all">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject.id} value={subject.name}>{subject.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-100 to-indigo-100 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">Total Students</p>
                <p className="text-3xl font-extrabold text-blue-900">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-100 to-emerald-100 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold">Active</p>
                <p className="text-3xl font-extrabold text-green-900">{students.filter(s => s.status === 'active').length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-100 to-pink-100 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold">Graduated</p>
                <p className="text-3xl font-extrabold text-purple-900">{students.filter(s => s.status === 'graduated').length}</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-100 to-yellow-100 border-0 shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-semibold">Average Score</p>
                <p className="text-3xl font-extrabold text-orange-900">
                  {students.length > 0 
                    ? Math.round(students.reduce((sum, s) => sum + s.averageScore, 0) / students.length)
                    : 0}%
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <Card key={student.id} className="hover:shadow-2xl transition-shadow rounded-2xl border-0 bg-white/90 backdrop-blur-md">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {/* Avatar with initials */}
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full text-lg font-bold text-white shadow ${avatarColors[student.name.charCodeAt(0) % avatarColors.length]}`}>{student.name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase()}</div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-gray-900">{student.name}</CardTitle>
                      <CardDescription className="text-xs text-gray-500">ID: {student.studentId}</CardDescription>
                    </div>
                  </div>
                  {getStatusBadge(student.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm gap-2">
                    <Mail className="h-4 w-4 text-blue-400" />
                    <span className="truncate font-medium">{student.email}</span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Phone className="h-4 w-4 text-green-400" />
                    <span>{student.phone}</span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Award className="h-4 w-4 text-purple-400" />
                    <span className="truncate">{Array.isArray(student.subjects) ? student.subjects.join(', ') : student.subjects || '-'}</span>
                  </div>
                  <div className="flex items-center text-sm gap-2">
                    <Calendar className="h-4 w-4 text-orange-400" />
                    <span>
                      Joined: {
                        (() => {
                          let joinDate: Date | null = null;
                          if (student.joinDate) {
                            if (typeof student.joinDate === 'string') {
                              joinDate = new Date(student.joinDate);
                            } else if (student.joinDate.toDate) {
                              joinDate = student.joinDate.toDate();
                            } else if (student.joinDate instanceof Date) {
                              joinDate = student.joinDate;
                            } else {
                              joinDate = new Date(student.joinDate);
                            }
                          }
                          return joinDate && isValid(joinDate) ? format(joinDate, 'MMM dd, yyyy') : 'N/A';
                        })()
                      }
                    </span>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Tests: <span className="font-semibold text-blue-700">{student.totalTests}</span></span>
                      <span>Avg: <span className="font-semibold text-purple-700">{student.averageScore}%</span></span>
                    </div>
                  </div>

                  {/* Action buttons with tooltips */}
                  <div className="flex space-x-2 pt-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditStudent(student)}
                            className="flex-1 border-blue-200 hover:bg-blue-50"
                            disabled={editLoading}
                          >
                            <Edit className="h-4 w-4 mr-1 text-blue-500" />
                            Edit
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Edit Student</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                            className="border-red-200 hover:bg-red-50"
                            disabled={deleteLoading}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Student</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-blue-200 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No students found</h3>
          <p className="text-gray-500 text-lg">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first student to get started!'}
          </p>
        </div>
      )}

      {/* Inactive Students Section */}
      {inactiveStudents.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Inactive Students</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Name</th>
                  <th className="px-4 py-2 border">Email</th>
                  <th className="px-4 py-2 border">Phone</th>
                  <th className="px-4 py-2 border">Student ID</th>
                  <th className="px-4 py-2 border">Course</th>
                  <th className="px-4 py-2 border">Batch</th>
                  <th className="px-4 py-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveStudents.map((student) => (
                  <tr key={student.studentId}>
                    <td className="px-4 py-2 border">{student.name}</td>
                    <td className="px-4 py-2 border">{student.email}</td>
                    <td className="px-4 py-2 border">{student.phone}</td>
                    <td className="px-4 py-2 border">{student.studentId}</td>
                    <td className="px-4 py-2 border">{student.course}</td>
                    <td className="px-4 py-2 border">{student.batch}</td>
                    <td className="px-4 py-2 border">
                      <button
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        onClick={() => handleRestoreStudent(student.studentId)}
                        disabled={restoreLoading}
                      >
                        {restoreLoading ? <Loader size={16} /> : 'Restore'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Student Dialog */}
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
              <div>
                <Label>Subjects</Label>
                <div className="flex flex-wrap gap-2">
                  {subjects.map(subject => (
                    <label key={subject.id} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        checked={editingStudent.subjects.includes(subject.name)}
                        onChange={e => setEditingStudent(prev => prev ? {
                          ...prev,
                          subjects: e.target.checked
                            ? [...prev.subjects, subject.name]
                            : prev.subjects.filter(s => s !== subject.name)
                        } : null)}
                      />
                      {subject.name}
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateStudent} className="w-full" disabled={editLoading}>
                {editLoading ? <Loader size={20} className="mx-auto" /> : 'Update Student'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}