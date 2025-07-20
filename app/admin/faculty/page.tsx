'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { UserCheck, Search, Plus, Edit, Trash2, Mail, Phone, Calendar, BookOpen, Users } from 'lucide-react';
import { format } from 'date-fns';
import { useFaculty, useAppDispatch } from '@/hooks/use-redux';
import { addFaculty, updateFaculty, deleteFaculty } from '@/app/store';

interface Faculty {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  facultyId: string;
  subjects: string[];
  experience?: number;
  qualification: string;
  createdAt: any; // Firestore Timestamp
  status?: 'active' | 'inactive' | 'on-leave';
  studentsCount?: number;
  rating?: number;
  isActive?: boolean;
  hasSignedUp?: boolean;
  signedUpAt?: any; // Firestore Timestamp
  role?: string;
}

export default function AdminFacultyPage() {
  const faculty = useFaculty();
  const dispatch = useAppDispatch();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);

  const [newFaculty, setNewFaculty] = useState({
    fullName: '',
    email: '',
    phone: '',
    facultyId: '',
    subjects: [] as string[],
    experience: 0,
    qualification: '',
    status: 'active' as const,
  });

  React.useEffect(() => {
    if (faculty.status === 'idle') {
      faculty.refetch();
    }
  }, [faculty.status, faculty.refetch]);

  if (faculty.status === 'loading') {
    return <div className="p-8 text-center">Loading faculty...</div>;
  }
  if (faculty.status === 'failed') {
    return <div className="p-8 text-center text-red-600">Failed to load faculty: {faculty.error}</div>;
  }

  const handleAddFaculty = async () => {
    const facultyMember: Faculty = {
      id: `FAC${Date.now()}`,
      ...newFaculty,
      createdAt: new Date(),
      studentsCount: 0,
      rating: 0,
      isActive: true,
      hasSignedUp: true,
      role: 'faculty',
    };
    await dispatch(addFaculty(facultyMember));
    setNewFaculty({
      fullName: '',
      email: '',
      phone: '',
      facultyId: '',
      subjects: [],
      experience: 0,
      qualification: '',
      status: 'active',
    });
    setShowAddModal(false);
  };

  const handleEditFaculty = (facultyMember: Faculty) => {
    setEditingFaculty(facultyMember);
  };

  const handleUpdateFaculty = async () => {
    if (!editingFaculty) return;
    const { id, ...updates } = editingFaculty;
    await dispatch(updateFaculty({ id, updates }));
    setEditingFaculty(null);
  };

  const handleDeleteFaculty = async (facultyId: string) => {
    if (confirm('Are you sure you want to delete this faculty member?')) {
      await dispatch(deleteFaculty(facultyId));
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'on-leave':
        return <Badge variant="outline">On Leave</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'Computer Science'];

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Management</h1>
            <p className="text-gray-600">Manage faculty members and their information</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Faculty
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Faculty Member</DialogTitle>
                <DialogDescription>Enter faculty information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={newFaculty.fullName}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, fullName: e.target.value }))}
                      placeholder="Enter faculty name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="facultyId">Faculty ID</Label>
                    <Input
                      id="facultyId"
                      value={newFaculty.facultyId}
                      onChange={(e) => setNewFaculty(prev => ({ ...prev, facultyId: e.target.value }))}
                      placeholder="Enter faculty ID"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newFaculty.email}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newFaculty.phone}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="qualification">Qualification</Label>
                  <Input
                    id="qualification"
                    value={newFaculty.qualification}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, qualification: e.target.value }))}
                    placeholder="Enter qualification"
                  />
                </div>
                <div>
                  <Label htmlFor="experience">Experience (Years)</Label>
                  <Input
                    id="experience"
                    type="number"
                    value={newFaculty.experience}
                    onChange={(e) => setNewFaculty(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter years of experience"
                  />
                </div>
                <div>
                  <Label>Subjects</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {subjectOptions.map(subject => (
                      <label key={subject} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={newFaculty.subjects.includes(subject)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewFaculty(prev => ({ ...prev, subjects: [...prev.subjects, subject] }));
                            } else {
                              setNewFaculty(prev => ({ ...prev, subjects: prev.subjects.filter(s => s !== subject) }));
                            }
                          }}
                        />
                        <span className="text-sm">{subject}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <Button onClick={handleAddFaculty} className="w-full">
                  Add Faculty Member
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
            placeholder="Search faculty..."
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
          <option value="on-leave">On Leave</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Faculty</p>
                <p className="text-2xl font-bold">{faculty.data?.length || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold">{faculty.data?.filter(f => f.status === 'active').length || 0}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-2xl font-bold">{faculty.data?.reduce((sum, f) => sum + f.studentsCount, 0) || 0}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Rating</p>
                <p className="text-2xl font-bold">
                  {faculty.data?.length > 0 
                    ? (faculty.data.reduce((sum, f) => sum + f.rating, 0) / faculty.data.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Grid */}
      {faculty.data?.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {faculty.data.map((facultyMember) => (
            <Card key={facultyMember.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{facultyMember.fullName}</CardTitle>
                    <CardDescription>ID: {facultyMember.facultyId}</CardDescription>
                  </div>
                  {getStatusBadge(facultyMember.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{facultyMember.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{facultyMember.phone}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{facultyMember.qualification}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                    <span>Joined: {
                      (() => {
                        try {
                          let date;
                          if (facultyMember.createdAt?.toDate) {
                            date = facultyMember.createdAt.toDate();
                          } else if (facultyMember.createdAt) {
                            date = new Date(facultyMember.createdAt);
                          } else {
                            return 'Not specified';
                          }
                          
                          if (isNaN(date.getTime())) {
                            return 'Invalid date';
                          }
                          
                          return format(date, 'MMM dd, yyyy');
                        } catch (error) {
                          return 'Invalid date';
                        }
                      })()
                    }</span>
                  </div>
                  
                  <div className="pt-2">
                    <p className="text-sm text-gray-600 mb-2">Subjects:</p>
                    <div className="flex flex-wrap gap-1">
                      {facultyMember.subjects.map((subject) => (
                        <Badge key={subject} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="pt-3 border-t">
                    <div className="flex justify-between text-sm">
                      <span>Students: {facultyMember.studentsCount}</span>
                      <span>Rating: {facultyMember.rating}/5</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      Experience: {facultyMember.experience} years
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditFaculty(facultyMember)}
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteFaculty(facultyMember.id)}
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
          <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No faculty found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first faculty member to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Faculty Modal */}
      {editingFaculty && (
        <Dialog open={!!editingFaculty} onOpenChange={() => setEditingFaculty(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Faculty Member</DialogTitle>
              <DialogDescription>Update faculty information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-name">Full Name</Label>
                  <Input
                    id="edit-name"
                    value={editingFaculty.fullName}
                    onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, fullName: e.target.value } : null)}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-facultyId">Faculty ID</Label>
                  <Input
                    id="edit-facultyId"
                    value={editingFaculty.facultyId}
                    onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, facultyId: e.target.value } : null)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editingFaculty.email}
                  onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, email: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-phone">Phone</Label>
                <Input
                  id="edit-phone"
                  value={editingFaculty.phone}
                  onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, phone: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-qualification">Qualification</Label>
                <Input
                  id="edit-qualification"
                  value={editingFaculty.qualification}
                  onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, qualification: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-experience">Experience (Years)</Label>
                <Input
                  id="edit-experience"
                  type="number"
                  value={editingFaculty.experience}
                  onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, experience: parseInt(e.target.value) || 0 } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={editingFaculty.status}
                  onChange={(e) => setEditingFaculty(prev => prev ? { ...prev, status: e.target.value as any } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>
              <div>
                <Label>Subjects</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {subjectOptions.map(subject => (
                    <label key={subject} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={editingFaculty.subjects.includes(subject)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditingFaculty(prev => prev ? { ...prev, subjects: [...prev.subjects, subject] } : null);
                          } else {
                            setEditingFaculty(prev => prev ? { ...prev, subjects: prev.subjects.filter(s => s !== subject) } : null);
                          }
                        }}
                      />
                      <span className="text-sm">{subject}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Button onClick={handleUpdateFaculty} className="w-full">
                Update Faculty Member
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}