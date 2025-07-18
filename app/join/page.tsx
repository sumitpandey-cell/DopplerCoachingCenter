'use client';

import { addStudentEnquiry, getSubjects, Subject } from '@/firebase/firestore';
import React, { useState, useEffect } from 'react';
import { addFacultyEnquiry } from '@/firebase/firestore'; // Added this import
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { UserPlus, CheckCircle, Phone, Mail, Calendar, UserCheck } from 'lucide-react';

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

  const handleSubjectChange = (subjectId: string) => {
    setFormData(prev => {
      const subjects = prev.subjects.includes(subjectId)
        ? prev.subjects.filter(s => s !== subjectId)
        : [...prev.subjects, subjectId];
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

  const [facultyFormData, setFacultyFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    qualification: '',
    experience: '',
    subjects: '',
    previousInstitution: '',
    notes: '',
  });
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyShowSuccessDialog, setFacultyShowSuccessDialog] = useState(false);
  const [facultyError, setFacultyError] = useState('');

  const handleFacultyInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFacultyFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFacultySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFacultyLoading(true);
    setFacultyError('');
    try {
      await addFacultyEnquiry({
        ...facultyFormData,
        submittedAt: new Date(),
        status: 'pending',
      });
      setFacultyShowSuccessDialog(true);
      setFacultyFormData({
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
      setFacultyError('Failed to submit enquiry. Please try again.');
    } finally {
      setFacultyLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-blue-600" />
            <UserCheck className="h-8 w-8 text-green-600 ml-2" />
        </div>
          <CardTitle className="text-2xl font-bold">Join Doppler Coaching</CardTitle>
          <CardDescription>
            Start your journey as a Student or Faculty
            </CardDescription>
          </CardHeader>
          <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="student">Student Inquiry</TabsTrigger>
              <TabsTrigger value="faculty">Faculty Application</TabsTrigger>
            </TabsList>
            <TabsContent value="student">
              {/* Student Inquiry Form (new layout) */}
              <form onSubmit={handleSubmit} className="space-y-4">
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
                        value={subject.id}
                        checked={formData.subjects.includes(subject.id)}
                        onChange={() => handleSubjectChange(subject.id)}
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
                    You'll receive your Student ID via email
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
            </TabsContent>
            <TabsContent value="faculty">
              {/* Faculty Application Form (unchanged) */}
              <form onSubmit={handleFacultySubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="facultyFullName">Full Name *</Label>
                  <Input
                    id="facultyFullName"
                    name="fullName"
                    value={facultyFormData.fullName}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter your full name"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultyEmail">Email Address *</Label>
                  <Input
                    id="facultyEmail"
                    name="email"
                    type="email"
                    value={facultyFormData.email}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter your email"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultyPhone">Phone Number *</Label>
                  <Input
                    id="facultyPhone"
                    name="phone"
                    type="tel"
                    value={facultyFormData.phone}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter your phone number"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="qualification">Highest Qualification *</Label>
                  <Input
                    id="qualification"
                    name="qualification"
                    value={facultyFormData.qualification}
                    onChange={handleFacultyInputChange}
                    placeholder="e.g., M.Sc. Physics, Ph.D. Mathematics"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="experience">Teaching Experience (Years) *</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    value={facultyFormData.experience}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter years of teaching experience"
                    required
                    min="0"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subjects">Subjects You Can Teach *</Label>
                  <Input
                    id="subjects"
                    name="subjects"
                    value={facultyFormData.subjects}
                    onChange={handleFacultyInputChange}
                    placeholder="e.g., Mathematics, Physics, Chemistry"
                    required
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="previousInstitution">Previous Institution</Label>
                  <Input
                    id="previousInstitution"
                    name="previousInstitution"
                    value={facultyFormData.previousInstitution}
                    onChange={handleFacultyInputChange}
                    placeholder="Enter your previous workplace"
                    className="mt-1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facultyNotes">Additional Information</Label>
                  <Textarea
                    id="facultyNotes"
                    name="notes"
                    value={facultyFormData.notes}
                    onChange={handleFacultyInputChange}
                    placeholder="Tell us about your teaching philosophy, achievements, or any other relevant information..."
                    rows={4}
                    className="mt-1"
                  />
                </div>
                {facultyError && (
                  <Alert variant="destructive">
                    <AlertDescription>{facultyError}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" disabled={facultyLoading} className="w-full text-lg py-3">
                  {facultyLoading ? 'Submitting...' : 'Submit Application'}
                </Button>
              </form>
              <Dialog open={facultyShowSuccessDialog} onOpenChange={setFacultyShowSuccessDialog}>
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
                    <Button onClick={() => setFacultyShowSuccessDialog(false)} className="px-8">
                      Close
                    </Button>
      </div>
                </DialogContent>
              </Dialog>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
