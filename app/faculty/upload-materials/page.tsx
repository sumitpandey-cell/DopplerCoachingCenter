'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addStudyMaterial } from '@/firebase/firestore';
import { useDataLoading } from '@/contexts/DataLoadingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import FileUpload from '@/components/FileUpload';
import { Upload, CheckCircle } from 'lucide-react';

export default function UploadMaterials() {
  const { userProfile } = useAuth();
  const { setIsDataLoading } = useDataLoading();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    fileUrl: '',
    fileName: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsDataLoading(loading);
  }, [loading, setIsDataLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (url: string, fileName: string) => {
    setFormData(prev => ({ ...prev, fileUrl: url, fileName }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fileUrl) {
      setError('Please upload a file');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await addStudyMaterial({
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        fileUrl: formData.fileUrl,
        fileName: formData.fileName,
        uploadedBy: userProfile?.name || 'Faculty',
        uploadedAt: new Date(),
      });

      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        subject: '',
        fileUrl: '',
        fileName: '',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error uploading material:', error);
      setError('Failed to upload material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Study Materials</h1>
        <p className="text-gray-600">Share resources and materials with your students</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Upload New Material
            </CardTitle>
            <CardDescription>
              Fill in the details and upload a file to share with students
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter material title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <select
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Physics">Physics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                  <option value="English">English</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="History">History</option>
                  <option value="Geography">Geography</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the material content"
                  rows={3}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>File Upload *</Label>
                <div className="mt-1">
                  <FileUpload onUploadComplete={handleFileUpload} />
                </div>
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
                    Study material uploaded successfully! Students can now access it.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading || !formData.fileUrl} className="w-full">
                {loading ? 'Uploading...' : 'Upload Material'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}