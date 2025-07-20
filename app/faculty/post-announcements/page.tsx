'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addFacultyUpdate, getFacultyByFacultyId } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle } from 'lucide-react';
import { useEffect } from 'react';

const UPDATE_TYPES = [
  { value: 'announcement', label: 'Announcement' },
  { value: 'test', label: 'Test' },
  { value: 'result', label: 'Result' },
];

export default function PostAnnouncements() {
  const { userProfile } = useAuth();
  const [subjects, setSubjects] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    subjectId: '',
    type: 'announcement',
    notifyAll: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch faculty subjects from userProfile or Firestore
    const fetchSubjects = async () => {
      if (userProfile?.facultyId) {
        const faculty = await getFacultyByFacultyId(userProfile.facultyId);
        if (faculty && Array.isArray(faculty.subjects)) {
          setSubjects(faculty.subjects);
          setFormData(prev => ({ ...prev, subjectId: faculty.subjects[0] || '' }));
        }
      }
    };
    fetchSubjects();
  }, [userProfile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!formData.subjectId) throw new Error('Please select a subject.');
      await addFacultyUpdate({
        title: formData.title,
        content: formData.content,
        subjectId: formData.subjectId,
        facultyId: userProfile?.facultyId || '',
        type: formData.type,
        notifyAllFacultyStudents: formData.notifyAll,
      });
      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        subjectId: subjects[0] || '',
        type: 'announcement',
        notifyAll: false,
      });
      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to post update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Update/Announcement</h1>
        <p className="text-gray-600">Share important notices, tests, or results with your students by subject</p>
      </div>
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Create New Update
            </CardTitle>
            <CardDescription>
              Fill in the details to notify students by subject
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="subjectId">Subject *</Label>
                <select
                  id="subjectId"
                  name="subjectId"
                  value={formData.subjectId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {subjects.map(subj => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="type">Type *</Label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {UPDATE_TYPES.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter title"
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your content here..."
                  rows={6}
                  required
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.length}/1000 characters
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notifyAll"
                  name="notifyAll"
                  checked={formData.notifyAll}
                  onChange={handleInputChange}
                  className="h-4 w-4"
                />
                <Label htmlFor="notifyAll">Notify all my students (across all my subjects)</Label>
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              {success && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Update posted successfully! Students can now view it.
                  </AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Posting...' : 'Post Update'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}