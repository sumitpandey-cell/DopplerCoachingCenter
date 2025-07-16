'use client';

import React, { useState, useEffect } from 'react';
import { addStudentEnquiry, getSubjects, Subject } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, CheckCircle, Phone, Mail, Calendar } from 'lucide-react';

export default function JoinNow() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    notes: '',
    subjects: [] as string[], // Add subjects array
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [error, setError] = useState('');
  const [subjectsList, setSubjectsList] = useState<Subject[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const subjects = await getSubjects();
        setSubjectsList(subjects);
      } catch (error) {
        console.error('Failed to fetch subjects:', error);
      }
    };
    fetchSubjects();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => {
      const subjects = prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject];
      return { ...prev, subjects };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.subjects.length === 0) {
      setError('Please select at least one subject.');
      setLoading(false);
      return;
    }

    try {
      await addStudentEnquiry({
        ...formData,
        submittedAt: new Date(),
        status: 'pending',
      });

      setShowSuccessDialog(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        notes: '',
        subjects: [],
      });
    } catch (error) {
      console.error('Error submitting enquiry:', error);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Doppler Coaching</h1>
          <p className="text-xl text-gray-600">
            Start your journey to academic excellence. Fill out the form below and we&apos;ll get back to you soon.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Student Enquiry Form</CardTitle>
            <CardDescription className="text-center">
              Please provide your details to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Subjects *</Label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {subjectsList.map(subject => (
                    <label key={subject.id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="subjects"
                        value={subject.name}
                        checked={formData.subjects.includes(subject.name)}
                        onChange={() => handleSubjectChange(subject.name)}
                        className="accent-blue-600"
                        required={formData.subjects.length === 0}
                      />
                      <span>{subject.name}</span>
                    </label>
                  ))}
                </div>
                {formData.subjects.length === 0 && (
                  <span className="text-red-500 text-xs">Please select at least one subject.</span>
                )}
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information or questions..."
                  rows={3}
                  className="mt-1"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full text-lg py-3">
                {loading ? 'Submitting...' : 'Submit Enquiry'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Success Dialog */}
        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <DialogTitle className="text-xl font-bold text-green-800">
                Enquiry Submitted Successfully!
              </DialogTitle>
              <DialogDescription className="text-gray-600 space-y-3">
                <p>Thank you for your interest in Doppler Coaching Center.</p>
                <p className="font-medium">What happens next:</p>
                <ul className="text-left space-y-1 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Our team will review your enquiry
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    A unique Student ID will be generated for you
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    You&apos;ll receive your Student ID via email
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Expected processing time: Within 24-48 hours
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-center mt-6">
              <Button onClick={() => setShowSuccessDialog(false)} className="px-8">
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}