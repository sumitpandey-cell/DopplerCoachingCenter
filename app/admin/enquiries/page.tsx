'use client';

import React, { useEffect, useState } from 'react';
import { getStudentEnquiries, updateEnquiryStatus, generateStudentAccount, StudentEnquiry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Search, Phone, Mail, Calendar, UserPlus, CheckCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { sendStudentIdEmail } from '@/lib/email-service';
import { Loader, Skeleton } from '@/components/ui/loader';
import { enrollStudentInSubjects } from '@/firebase/subjects';
import { useEnquiries } from '@/hooks/use-redux';
import { useSubjects } from '@/hooks/use-redux';
import { useDataLoading } from '@/contexts/DataLoadingContext';

export default function AdminEnquiries() {
  const [filteredEnquiries, setFilteredEnquiries] = useState<StudentEnquiry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedStudentId, setGeneratedStudentId] = useState('');
  const [generatedStudentEmail, setGeneratedStudentEmail] = useState('');
  const [buttonLoading, setButtonLoading] = useState(false);

  // Redux hooks
  const enquiries = useEnquiries();
  const subjects = useSubjects();
  const { setIsDataLoading } = useDataLoading();

  // Set isDataLoading only for enquiries list (critical)
  useEffect(() => {
    setIsDataLoading(enquiries.status === 'loading');
  }, [enquiries.status, setIsDataLoading]);

  useEffect(() => {
    if (enquiries.status === 'idle') {
      enquiries.refetch();
    }
    if (subjects.status === 'idle') {
      subjects.refetch();
    }
  }, [enquiries.status, enquiries.refetch, subjects.status, subjects.refetch]);

  useEffect(() => {
    let filtered = enquiries.data || [];

    if (searchTerm) {
      filtered = filtered.filter(enquiry =>
        enquiry.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        enquiry.phone.includes(searchTerm)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(enquiry => enquiry.status === statusFilter);
    }

    setFilteredEnquiries(filtered);
  }, [enquiries.data, searchTerm, statusFilter]);

  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    return `DPLR${year}${randomNum.toString().padStart(4, '0')}`;
  };

  const handleGenerateStudentId = async (enquiry: StudentEnquiry) => {
    if (!enquiry.id) return;

    setGeneratingId(enquiry.id);

    try {
      const studentId = generateStudentId();
      const defaultPassword = `${enquiry.fullName.split(' ')[0].toLowerCase()}123`; // More personalized password

      // Create student account
      await generateStudentAccount({
        studentId,
        email: enquiry.email,
        fullName: enquiry.fullName,
        phone: enquiry.phone,
        courses: [], // Pass empty array for compatibility
        subjects: enquiry.subjects || [], // Copy subjects from enquiry
        password: defaultPassword,
        enquiryId: enquiry.id,
        role: 'student',
        hasSignedUp:false
      });

      // Enroll student in selected subjects and create studentFees
      if (enquiry.subjects && enquiry.subjects.length > 0) {
        console.log("enrollStudentInSubjects")
        await enrollStudentInSubjects(studentId, enquiry.subjects);
      }

      // Update enquiry status
      await updateEnquiryStatus(enquiry.id, 'id_generated', studentId);

      // Send email notification
      try {
        await sendStudentIdEmail({
          studentName: enquiry.fullName,
          studentEmail: enquiry.email,
          studentId,
          password: defaultPassword,
        });
        
        console.log('Email sent successfully to:', enquiry.email);
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        // Continue even if email fails, but show warning
        alert('Student ID generated successfully, but email notification failed. Please inform the student manually.');
      }

      // Update local state
      enquiries.refetch(); // Refetch to update Redux state

      setGeneratedStudentId(studentId);
      setGeneratedStudentEmail(enquiry.email);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error generating student ID:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to generate Student ID. ';
      if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please try again.';
      }
      
      alert(errorMessage);
    } finally {
      setGeneratingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'id_generated':
        return <Badge variant="default">ID Generated</Badge>;
      case 'contacted':
        return <Badge variant="outline">Contacted</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (enquiries.status === 'loading') {
    return (
      <div className="p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4 mb-4" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (enquiries.status === 'failed') {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load enquiries: {enquiries.error}
            <Button 
              onClick={enquiries.refetch} 
              variant="outline" 
              size="sm" 
              className="ml-2"
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Student Enquiries</h1>
            <p className="text-gray-600">Manage student enquiries and generate Student IDs</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={enquiries.status === 'loading' ? 'secondary' : 'default'}>
              {enquiries.status}
            </Badge>
            <Button 
              onClick={enquiries.refetch}
              disabled={enquiries.status === 'loading'}
              size="sm"
              variant="outline"
            >
              <Users className={`h-4 w-4 mr-2 ${enquiries.status === 'loading' ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="id_generated">ID Generated</option>
          <option value="contacted">Contacted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Enquiries</p>
                <p className="text-2xl font-bold">{enquiries.data?.length || 0}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{enquiries.data?.filter(e => e.status === 'pending').length || 0}</p>
              </div>
              <Calendar className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">IDs Generated</p>
                <p className="text-2xl font-bold">{enquiries.data?.filter(e => e.status === 'id_generated').length || 0}</p>
              </div>
              <UserPlus className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold">
                  {enquiries.data?.filter(e => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    const submittedDate = e.submittedAt?.toDate ? e.submittedAt.toDate() : new Date(e.submittedAt);
                    return submittedDate >= weekAgo;
                  }).length || 0}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enquiries Grid */}
      {filteredEnquiries.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{enquiry.fullName}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(
                        enquiry.submittedAt?.toDate ? enquiry.submittedAt.toDate() : new Date(enquiry.submittedAt),
                        'MMM dd, yyyy'
                      )}
                    </CardDescription>
                  </div>
                  {getStatusBadge(enquiry.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <Mail className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="truncate">{enquiry.email}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{enquiry.phone}</span>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">Subjects:</p>
                    <p className="text-gray-600">
                      {enquiry.subjects && enquiry.subjects.length > 0 && subjects.data && subjects.data.length > 0
                        ? enquiry.subjects
                            .map((id: string) => {
                              const subj = subjects.data.find((s: any) => s.id === id);
                              return subj ? subj.name : id;
                            })
                            .join(', ')
                        : 'No subjects selected'}
                    </p>
                  </div>
                  
                  {enquiry.notes && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Notes:</p>
                      <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
                        {enquiry.notes}
                      </p>
                    </div>
                  )}

                  {enquiry.studentId && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Student ID:</p>
                      <div className="flex items-center space-x-2">
                        <code className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {enquiry.studentId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(enquiry.studentId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    {enquiry.status === 'pending' ? (
                      <Button
                        onClick={() => handleGenerateStudentId(enquiry)}
                        disabled={generatingId === enquiry.id}
                        className="w-full"
                        loading={buttonLoading}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {generatingId === enquiry.id ? 'Generating...' : 'Generate Student ID'}
                      </Button>
                    ) : (
                      <div className="text-center text-sm text-gray-500">
                        Student ID has been generated and sent via email
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Student enquiries will appear here when submitted'
            }
          </p>
        </div>
      )}

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center">
            <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-green-800">
              Student ID Generated Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 space-y-3">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium">Student ID: 
                  <code className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {generatedStudentId}
                  </code>
                </p>
                <p className="text-sm mt-2">Email sent to: {generatedStudentEmail}</p>
              </div>
              <p className="text-sm">
                The student has been notified via email with their login credentials.
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
  );
}