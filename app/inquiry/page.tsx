'use client';

import React, { useState } from 'react';
import { addInquiry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, CheckCircle, Phone, Mail, Calendar } from 'lucide-react';

export default function StudentInquiry() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    parentName: '',
    parentPhone: '',
    address: '',
    previousSchool: '',
    interestedCourses: '',
    preferredBatch: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
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
      await addInquiry({
        ...formData,
        submittedAt: new Date(),
        status: 'pending',
      });

      setShowSuccessDialog(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        parentName: '',
        parentPhone: '',
        address: '',
        previousSchool: '',
        interestedCourses: '',
        preferredBatch: '',
        message: '',
      });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setError('Failed to submit inquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join Doppler Coaching</h1>
          <p className="text-xl text-gray-600">
            Start your journey to academic excellence. Fill out the inquiry form below and our faculty will contact you soon.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Student Admission Inquiry</CardTitle>
            <CardDescription className="text-center">
              Please provide your details for admission process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      required
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="address">Address *</Label>
                  <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your complete address"
                    required
                    rows={2}
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Parent/Guardian Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Parent/Guardian Information</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="parentName">Parent/Guardian Name *</Label>
                    <Input
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleInputChange}
                      placeholder="Enter parent/guardian name"
                      required
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="parentPhone">Parent/Guardian Phone *</Label>
                    <Input
                      id="parentPhone"
                      name="parentPhone"
                      type="tel"
                      value={formData.parentPhone}
                      onChange={handleInputChange}
                      placeholder="Enter parent/guardian phone"
                      required
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Academic Information</h3>
                
                <div>
                  <Label htmlFor="previousSchool">Previous School/College</Label>
                  <Input
                    id="previousSchool"
                    name="previousSchool"
                    value={formData.previousSchool}
                    onChange={handleInputChange}
                    placeholder="Enter your previous school/college name"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="interestedCourses">Interested Courses *</Label>
                    <select
                      id="interestedCourses"
                      name="interestedCourses"
                      value={formData.interestedCourses}
                      onChange={handleInputChange}
                      required
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Course</option>
                      <option value="JEE Main & Advanced">JEE Main & Advanced</option>
                      <option value="NEET">NEET</option>
                      <option value="Class 11th Science">Class 11th Science</option>
                      <option value="Class 12th Science">Class 12th Science</option>
                      <option value="Foundation Course (Class 9th-10th)">Foundation Course (Class 9th-10th)</option>
                      <option value="Crash Course">Crash Course</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="preferredBatch">Preferred Batch Timing</Label>
                    <select
                      id="preferredBatch"
                      name="preferredBatch"
                      value={formData.preferredBatch}
                      onChange={handleInputChange}
                      className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Timing</option>
                      <option value="Morning (6:00 AM - 12:00 PM)">Morning (6:00 AM - 12:00 PM)</option>
                      <option value="Afternoon (12:00 PM - 6:00 PM)">Afternoon (12:00 PM - 6:00 PM)</option>
                      <option value="Evening (6:00 PM - 10:00 PM)">Evening (6:00 PM - 10:00 PM)</option>
                      <option value="Weekend Only">Weekend Only</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="message">Additional Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Any additional information or questions you'd like to share..."
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
                {loading ? 'Submitting...' : 'Submit Inquiry'}
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
                Inquiry Submitted Successfully!
              </DialogTitle>
              <DialogDescription className="text-gray-600 space-y-3">
                <p>Thank you for your interest in Doppler Coaching Center.</p>
                <p className="font-medium">Our faculty will contact you soon to discuss:</p>
                <ul className="text-left space-y-1 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Course details and curriculum
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    Batch timings and schedule
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    Fee structure and admission process
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Expected contact time: Within 24-48 hours
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