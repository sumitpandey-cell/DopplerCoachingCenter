'use client';

import React, { useState } from 'react';
import { addFacultyEnquiry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserCheck, CheckCircle, Phone, Mail, Calendar } from 'lucide-react';

export default function JoinFaculty() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    subjects: '',
    previousInstitution: '',
    notes: '',
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
      await addFacultyEnquiry({
        ...formData,
        submittedAt: new Date(),
        status: 'pending',
      });

      setShowSuccessDialog(true);
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        qualification: '',
        experience: '',
        subjects: '',
        previousInstitution: '',
        notes: '',
      });
    } catch (error) {
      console.error('Error submitting faculty enquiry:', error);
      setError('Failed to submit enquiry. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <UserCheck className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Join as Faculty</h1>
          <p className="text-xl text-gray-600">
            Share your expertise and inspire the next generation. Apply to become a faculty member at Doppler Coaching.
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Faculty Application Form</CardTitle>
            <CardDescription className="text-center">
              Please provide your details to apply for a faculty position
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
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                
                <div>
                  <Label htmlFor="qualification">Highest Qualification *</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    placeholder="e.g., M.Sc. Physics, Ph.D. Mathematics"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="experience">Teaching Experience (Years) *</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="Enter years of teaching experience"
                    required
                    min="0"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="subjects">Subjects You Can Teach *</Label>
                  <Input
                    id="subjects"
                    name="subjects"
                    value={formData.subjects}
                    onChange={handleInputChange}
                    placeholder="e.g., Mathematics, Physics, Chemistry"
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="previousInstitution">Previous Institution</Label>
                  <Input
                    id="previousInstitution"
                    name="previousInstitution"
                    value={formData.previousInstitution}
                    onChange={handleInputChange}
                    placeholder="Enter your previous workplace"
                    className="mt-1"
                  />
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <Label htmlFor="notes">Additional Information</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Tell us about your teaching philosophy, achievements, or any other relevant information..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" disabled={loading} className="w-full text-lg py-3">
                {loading ? 'Submitting...' : 'Submit Application'}
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
                Application Submitted Successfully!
              </DialogTitle>
              <DialogDescription className="text-gray-600 space-y-3">
                <p>Thank you for your interest in joining Doppler Coaching Center as a faculty member.</p>
                <p className="font-medium">What happens next:</p>
                <ul className="text-left space-y-1 text-sm">
                  <li className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-blue-500" />
                    Our HR team will review your application
                  </li>
                  <li className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                    You may be contacted for an interview
                  </li>
                  <li className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-blue-500" />
                    A unique Faculty ID will be generated upon approval
                  </li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  Expected processing time: Within 5-7 business days
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