'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { addTestResult } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ClipboardList, CheckCircle } from 'lucide-react';

export default function EnterScores() {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    testName: '',
    subject: '',
    score: '',
    maxScore: '',
    testDate: new Date().toISOString().split('T')[0],
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const score = parseInt(formData.score);
    const maxScore = parseInt(formData.maxScore);
    
    if (score > maxScore) {
      setError('Score cannot be greater than maximum score');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const percentage = Math.round((score / maxScore) * 100);
      
      await addTestResult({
        studentId: formData.studentId,
        studentName: formData.studentName,
        testName: formData.testName,
        subject: formData.subject,
        score,
        maxScore,
        percentage,
        testDate: new Date(formData.testDate),
        enteredBy: userProfile?.name || 'Faculty',
      });

      setSuccess(true);
      setFormData({
        studentId: '',
        studentName: '',
        testName: '',
        subject: '',
        score: '',
        maxScore: '',
        testDate: new Date().toISOString().split('T')[0],
      });

      setTimeout(() => setSuccess(false), 5000);
    } catch (error) {
      console.error('Error entering test result:', error);
      setError('Failed to enter test result. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter Test Scores</h1>
        <p className="text-gray-600">Record student test results and performance</p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ClipboardList className="h-5 w-5 mr-2" />
              Enter Test Result
            </CardTitle>
            <CardDescription>
              Fill in the student details and test scores
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    placeholder="Enter student ID"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="studentName">Student Name *</Label>
                  <Input
                    id="studentName"
                    name="studentName"
                    value={formData.studentName}
                    onChange={handleInputChange}
                    placeholder="Enter student name"
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="testName">Test Name *</Label>
                <Input
                  id="testName"
                  name="testName"
                  value={formData.testName}
                  onChange={handleInputChange}
                  placeholder="Enter test name"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="score">Score Obtained *</Label>
                  <Input
                    id="score"
                    name="score"
                    type="number"
                    value={formData.score}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="maxScore">Maximum Score *</Label>
                  <Input
                    id="maxScore"
                    name="maxScore"
                    type="number"
                    value={formData.maxScore}
                    onChange={handleInputChange}
                    placeholder="100"
                    min="1"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="percentage">Percentage</Label>
                  <Input
                    id="percentage"
                    value={
                      formData.score && formData.maxScore
                        ? `${Math.round((parseInt(formData.score) / parseInt(formData.maxScore)) * 100)}%`
                        : ''
                    }
                    disabled
                    className="mt-1 bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="testDate">Test Date *</Label>
                <Input
                  id="testDate"
                  name="testDate"
                  type="date"
                  value={formData.testDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1"
                />
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
                    Test result entered successfully! Student can now view their score.
                  </AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Saving...' : 'Save Test Result'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}