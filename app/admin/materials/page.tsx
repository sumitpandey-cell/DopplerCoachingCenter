'use client';

import React, { useEffect, useState } from 'react';
import { 
  getStudyMaterials, 
  StudyMaterial, 
  addStudyMaterial, 
  updateStudyMaterial, 
  deleteStudyMaterial 
} from '@/firebase/firestore';
import { getSubjects } from '@/firebase/subjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Search, Plus, Edit, Trash2, Download, Upload, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { Loader, Skeleton } from '@/components/ui/loader';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../store';
import { fetchMaterials } from '../../store';

export default function AdminMaterials() {
  const [filteredMaterials, setFilteredMaterials] = useState<StudyMaterial[]>([]);
  const [subjects, setSubjects] = useState<{id: string; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<StudyMaterial | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [totalDownloads, setTotalDownloads] = useState(0);

  const [newMaterial, setNewMaterial] = useState({
    title: '',
    description: '',
    subject: '',
    fileName: '',
    fileUrl: '',
  });

  const dispatch = useDispatch<AppDispatch>();
  const materialsState = useSelector((state: RootState) => state.materials);
  const { data: materials, status: materialsStatus, error: materialsError } = materialsState;

  useEffect(() => {
    if (materialsStatus === 'idle') {
      dispatch(fetchMaterials());
    }
  }, [dispatch, materialsStatus]);

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

  const availableSubjects = Array.from(new Set(materials.map(m => m.subject)));

  const handleAddMaterial = async () => {
    try {
      setButtonLoading(true);
      
      const materialData = {
        ...newMaterial,
        uploadedBy: 'Admin', // You can get this from user context
        uploadedAt: new Date(),
      };

      const materialId = await addStudyMaterial(materialData);
      
      // Refresh materials list
      const updatedMaterials = await getStudyMaterials();
      setMaterials(updatedMaterials);
      setFilteredMaterials(updatedMaterials);
      
      setNewMaterial({
        title: '',
        description: '',
        subject: '',
        fileName: '',
        fileUrl: '',
      });
      setShowAddModal(false);
    } catch (error) {
      console.error('Error adding material:', error);
      alert('Failed to add material. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleEditMaterial = (material: StudyMaterial) => {
    setEditingMaterial(material);
  };

  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;
    
    try {
      setButtonLoading(true);
      
      await updateStudyMaterial(editingMaterial.id!, editingMaterial);
      
      // Refresh materials list
      const updatedMaterials = await getStudyMaterials();
      setMaterials(updatedMaterials);
      setFilteredMaterials(updatedMaterials);
      
      setEditingMaterial(null);
    } catch (error) {
      console.error('Error updating material:', error);
      alert('Failed to update material. Please try again.');
    } finally {
      setButtonLoading(false);
    }
  };

  const handleDeleteMaterial = async (materialId: string) => {
    if (confirm('Are you sure you want to delete this material?')) {
      try {
        setButtonLoading(true);
        
        await deleteStudyMaterial(materialId);
        
        // Refresh materials list
        const updatedMaterials = await getStudyMaterials();
        setMaterials(updatedMaterials);
        setFilteredMaterials(updatedMaterials);
        
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material. Please try again.');
      } finally {
        setButtonLoading(false);
      }
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

  // Simple skeleton for materials list
  function MaterialsSkeleton() {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (loading) {
    // Only show a minimal spinner while checking auth (if needed)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">Study Materials</h1>
        {loading ? <MaterialsSkeleton /> : (
          <>
            <div className="mb-8">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Materials Management</h1>
                  <p className="text-gray-600">Manage study materials and resources</p>
                </div>
                <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
                  <DialogTrigger asChild>
                    <Button loading={buttonLoading}>
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
                          {subjects.map(subject => (
                            <option key={subject.id} value={subject.name}>{subject.name}</option>
                          ))}
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
                      <Button loading={buttonLoading} onClick={handleAddMaterial} className="w-full">
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
                  <option key={subject.id} value={subject.name}>{subject.name}</option>
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
                      <p className="text-2xl font-bold">{availableSubjects.length}</p>
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
                      <p className="text-2xl font-bold">{totalDownloads}</p>
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
                        {subjects.map(subject => (
                          <option key={subject.id} value={subject.name}>{subject.name}</option>
                        ))}
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
                    <Button loading={buttonLoading} onClick={handleUpdateMaterial} className="w-full">
                      Update Material
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </>
        )}
      </div>
    </div>
  );
}