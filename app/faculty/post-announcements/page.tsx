'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addAnnouncement } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Bell, CheckCircle } from 'lucide-react';

export default function PostAnnouncements() {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await addAnnouncement({
        title: formData.title,
        content: formData.content,
        priority: formData.priority,
        createdBy: userProfile?.name || 'Faculty',
        createdAt: new Date(),
      });

      setSuccess(true);
      setFormData({
        title: '',
        content: '',
        priority: 'medium',
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error posting announcement:', error);
      setError('Failed to post announcement. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Post Announcements</h1>
        <p className="text-gray-600">Share important notices and updates with students</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Create New Announcement
            </CardTitle>
            <CardDescription>
              Fill in the details to notify all students
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
                  placeholder="Enter announcement title"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <p className="text-sm text-gray-500 mt-1">
                  High priority announcements will be highlighted for students
                </p>
              </div>

              <div>
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  placeholder="Write your announcement content here..."
                  rows={6}
                  required
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {formData.content.length}/1000 characters
                </p>
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
                    Announcement posted successfully! All students can now view it.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Posting...' : 'Post Announcement'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        {(formData.title || formData.content) && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>How your announcement will appear to students</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold">{formData.title || 'Announcement Title'}</h3>
                  <span className={`px-2 py-1 text-xs rounded ${
                    formData.priority === 'high' ? 'bg-red-100 text-red-800' :
                    formData.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formData.priority.charAt(0).toUpperCase() + formData.priority.slice(1)} Priority
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {formData.content || 'Your announcement content will appear here...'}
                </p>
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Posted by: {userProfile?.name || 'Faculty'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}