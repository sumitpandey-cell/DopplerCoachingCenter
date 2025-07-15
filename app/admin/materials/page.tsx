'use client';

import React, { useEffect, useState } from 'react';
import { getStudyMaterials, StudyMaterial } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Search, Plus, Edit, Trash2, Download, Upload, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    subject: '',
    fileName: '',
    fileUrl: '',
  });

  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const data = await getStudyMaterials();
        setMaterials(data);
        setFilteredMaterials(data);
      } catch (error) {
        console.error('Error fetching materials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMaterials();
  }, []);

  useEffect(() => {
    let filtered = materials;

    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.uploadedBy.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (subjectFilter !== 'all') {
      filtered = filtered.filter(material => material.subject === subjectFilter);
    }

    setFilteredMaterials(filtered);
  }, [materials, searchTerm, subjectFilter]);

  const subjects = Array.from(new Set(materials.map(m => m.subject)));

  const handleAddMaterial = () => {
    const material: StudyMaterial = {
      id: `MAT${Date.now()}`,
      ...newMaterial,
      uploadedBy: 'Admin',
      uploadedAt: new Date(),
    };

    setMaterials(prev => [material, ...prev]);
    setNewMaterial({
      title: '',
      description: '',
      subject: '',
      fileName: '',
      fileUrl: '',
    });
    setShowAddModal(false);
  };

  const handleEditMaterial = (material: StudyMaterial) => {
    setEditingMaterial(material);
  };

  const handleUpdateMaterial = () => {
    if (!editingMaterial) return;

    setMaterials(prev =>
      prev.map(m => m.id === editingMaterial.id ? editingMaterial : m)
    );
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setMaterials(prev => prev.filter(m => m.id !== materialId));
    }
  };

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials Management</h1>
            <p className="text-gray-600">Manage study materials and resources</p>
          </div>
          <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Study Material</DialogTitle>
                <DialogDescription>Upload a new study material</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newMaterial.title}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter material title"
                  />
                </div>
                <div>
                  <Label htmlFor="subject">Subject</Label>
                  <select
                    id="subject"
                    value={newMaterial.subject}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, subject: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Subject</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMaterial.description}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter material description"
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="fileName">File Name</Label>
                  <Input
                    id="fileName"
                    value={newMaterial.fileName}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, fileName: e.target.value }))}
                    placeholder="Enter file name"
                  />
                </div>
                <div>
                  <Label htmlFor="fileUrl">File URL</Label>
                  <Input
                    id="fileUrl"
                    value={newMaterial.fileUrl}
                    onChange={(e) => setNewMaterial(prev => ({ ...prev, fileUrl: e.target.value }))}
                    placeholder="Enter file URL or upload file"
                  />
                </div>
                <Button onClick={handleAddMaterial} className="w-full">
                  Add Material
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
            placeholder="Search materials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="all">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Materials</p>
                <p className="text-2xl font-bold">{materials.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Subjects</p>
                <p className="text-2xl font-bold">{subjects.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold">
                  {materials.filter(m => {
                    const now = new Date();
                    const materialDate = new Date(m.uploadedAt);
                    return materialDate.getMonth() === now.getMonth() && 
                           materialDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Upload className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Download className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">{material.subject}</Badge>
                </div>
                <CardTitle className="text-lg">{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    Uploaded by: {material.uploadedBy}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    {format(material.uploadedAt, 'MMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-gray-600">
                    File: {material.fileName}
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(material.fileUrl, material.fileName)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditMaterial(material)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMaterial(material.id!)}
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
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No materials found</h3>
          <p className="text-gray-500">
            {searchTerm || subjectFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Add your first study material to get started'
            }
          </p>
        </div>
      )}

      {/* Edit Material Modal */}
      {editingMaterial && (
        <Dialog open={!!editingMaterial} onOpenChange={() => setEditingMaterial(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Study Material</DialogTitle>
              <DialogDescription>Update material information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={editingMaterial.title}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>
              <div>
                <Label htmlFor="edit-subject">Subject</Label>
                <select
                  id="edit-subject"
                  value={editingMaterial.subject}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, subject: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Computer Science">Computer Science</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editingMaterial.description}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="edit-fileName">File Name</Label>
                <Input
                  id="edit-fileName"
                  value={editingMaterial.fileName}
                  onChange={(e) => setEditingMaterial(prev => prev ? { ...prev, fileName: e.target.value } : null)}
                />
              </div>
              <Button onClick={handleUpdateMaterial} className="w-full">
                Update Material
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}