'use client';

import React, { useEffect, useState } from 'react';
<<<<<<< HEAD
import { getStudyMaterials, StudyMaterial } from '@/firebase/firestore';
import { getSubjects, Subject } from '@/firebase/subjects';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
=======
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
>>>>>>> f285f7a4ce32568098c5d4c045209f1d9ead2aea
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BookOpen, Download, Search, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { useSelector } from 'react-redux';
import { fetchMaterials, fetchSubjects, useAppDispatch } from '../../store';
import type { RootState } from '../../store';

export default function StudentMaterialsPage() {
  const { setIsDataLoading } = useDataLoading();
  const dispatch = useAppDispatch();
  const { data: materials, status: materialsStatus } = useSelector((state: RootState) => state.materials);
  const { data: student, status: studentStatus } = useSelector((state: RootState) => state.student);
  const { data: subjects, status: subjectsStatus } = useSelector((state: RootState) => state.subjects);
  
  const [searchTerm, setSearchTerm] = useState('');
<<<<<<< HEAD
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);
=======
>>>>>>> f285f7a4ce32568098c5d4c045209f1d9ead2aea

  useEffect(() => {
    if (materialsStatus === 'idle') dispatch(fetchMaterials());
    if (subjectsStatus === 'idle') dispatch(fetchSubjects());
  }, [materialsStatus, subjectsStatus, dispatch]);

<<<<<<< HEAD
  useEffect(() => {
    const fetchSubjects = async () => {
      const subs = await getSubjects();
      setSubjectsList(subs);
    };
    fetchSubjects();
  }, []);

  // Filter materials by student subjects
=======
>>>>>>> f285f7a4ce32568098c5d4c045209f1d9ead2aea
  useEffect(() => {
    setIsDataLoading(materialsStatus === 'loading' || studentStatus === 'loading' || subjectsStatus === 'loading');
  }, [materialsStatus, studentStatus, subjectsStatus, setIsDataLoading]);

  // Ensure all data is loaded before filtering
  if (materialsStatus !== 'succeeded' || studentStatus !== 'succeeded' || subjectsStatus !== 'succeeded') {
    // Render loading state or null while waiting for data
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

  // Create a map of subject names to subject IDs for efficient lookup
  const subjectNameToIdMap = new Map(subjects.map(s => [s.name, s.id]));

  // Filter materials by student's enrolled subjects first
  const studentSubjectIds = student?.subjects || [];
  const enrolledMaterials = materials.filter((mat: any) => {
    const subjectId = subjectNameToIdMap.get(mat.subject);
    return subjectId ? studentSubjectIds.includes(subjectId) : false;
  });

  // Then, filter by the search term
  const filteredMaterials = enrolledMaterials.filter((material: any) => {
    const term = searchTerm.toLowerCase();
    return (
      (material.title?.toLowerCase() || '').includes(term) ||
      (material.description?.toLowerCase() || '').includes(term) ||
      (material.subject?.toLowerCase() || '').includes(term)
    );
  });

  const handleDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 md:p-8 w-full">
      <h1 className="text-3xl font-bold mb-6">My Study Materials</h1>

      {/* Search Filter */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by title, description, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
<<<<<<< HEAD
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Subjects</option>
          {subjectsList.filter(sub => subjects.includes(sub.id)).map((subject) => (
            <option key={subject.id} value={subject.id}>{subject.name}</option>
          ))}
        </select>
      </div>
      {/* Materials Grid */}
      {filteredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material) => (
            <Card key={material.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  <Badge variant="secondary">{subjectsList.find(s => s.id === material.subject)?.name || material.subject}</Badge>
                </div>
                <CardTitle className="text-lg">{material.title}</CardTitle>
                <CardDescription>{material.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="h-4 w-4 mr-2" />
                    Uploaded on {format(material.uploadedAt, 'MMM dd, yyyy')}
                  </div>
                  <Button
                    onClick={() => handleDownload(material.fileUrl, material.fileName)}
                    className="w-full"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
=======
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium">No study materials found</h3>
          <p className="mt-1 text-sm">There are no materials for your enrolled subjects, or your search returned no results.</p>
>>>>>>> f285f7a4ce32568098c5d4c045209f1d9ead2aea
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMaterials.map((material: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 flex flex-col gap-2 border border-gray-200 dark:border-gray-800">
              <div className="font-semibold text-lg mb-2">{material.title || 'Material'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Subject: {material.subject || 'N/A'}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Uploaded: {material.uploadedAt ? new Date(material.uploadedAt.seconds ? material.uploadedAt.seconds * 1000 : material.uploadedAt).toLocaleDateString() : 'N/A'}</div>
              <a href={material.fileUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">Download</a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}