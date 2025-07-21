'use client';

import React, { useEffect, useState } from 'react';
import { getFacultyEnquiries, updateFacultyEnquiryStatus, generateFacultyAccount, FacultyEnquiry } from '@/firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UserCheck, Search, Phone, Mail, Calendar, UserPlus, CheckCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';
import { sendFacultyIdEmail } from '@/lib/email-service';

export default function AdminFacultyEnquiries() {
  const [enquiries, setEnquiries] = useState<FacultyEnquiry[]>([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState<FacultyEnquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [generatedFacultyId, setGeneratedFacultyId] = useState('');
  const [generatedFacultyEmail, setGeneratedFacultyEmail] = useState('');

  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        const data = await getFacultyEnquiries();
        setEnquiries(data);
        setFilteredEnquiries(data);
      } catch (error) {
        console.error('Error fetching faculty enquiries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEnquiries();
  }, []);

  useEffect(() => {
    let filtered = enquiries;

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
  }, [enquiries, searchTerm, statusFilter]);

  const generateFacultyId = () => {
    const year = new Date().getFullYear().toString().slice(-2);
    const randomNum = Math.floor(Math.random() * 900) + 100;
    return `FAC${year}${randomNum.toString().padStart(3, '0')}`;
  };

  const handleGenerateFacultyId = async (enquiry: FacultyEnquiry) => {
    if (!enquiry.id) return;

    setGeneratingId(enquiry.id);

    try {
      const facultyId = generateFacultyId();
      const defaultPassword = `${enquiry.fullName.split(' ')[0].toLowerCase()}123`;

      // Create faculty account
      await generateFacultyAccount({
        facultyId,
        email: enquiry.email,
        fullName: enquiry.fullName,
        phone: enquiry.phone,
        qualification: enquiry.qualification,
        subjects: enquiry.subjects.split(',').map(s => s.trim()),
        role: 'faculty',
        enquiryId: enquiry.id
      });

      // Update enquiry status
      await updateFacultyEnquiryStatus(enquiry.id, 'id_generated', facultyId);

      // Send email notification
      try {
        await sendFacultyIdEmail({
          facultyName: enquiry.fullName,
          facultyEmail: enquiry.email,
          facultyId,
          password: defaultPassword,
        });
        
      } catch (emailError) {
        console.error('Error sending email:', emailError);
        alert('Faculty ID generated successfully, but email notification failed. Please inform the faculty manually.');
      }

      // Update local state
      setEnquiries(prev =>
        prev.map(e =>
          e.id === enquiry.id
            ? { ...e, status: 'id_generated', facultyId }
            : e
        )
      );

      setGeneratedFacultyId(facultyId);
      setGeneratedFacultyEmail(enquiry.email);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error generating faculty ID:', error);
      alert('Failed to generate Faculty ID. Please try again.');
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
      case 'approved':
        return <Badge variant="outline">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Enquiries</h1>
        <p className="text-gray-600">Manage faculty applications and generate Faculty IDs</p>
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
          <option value="approved">Approved</option>
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
                <p className="text-2xl font-bold">{enquiries.length}</p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{enquiries.filter(e => e.status === 'pending').length}</p>
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
                <p className="text-2xl font-bold">{enquiries.filter(e => e.status === 'id_generated').length}</p>
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
                  {enquiries.filter(e => {
                    const now = new Date();
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return new Date(e.submittedAt) >= weekAgo;
                  }).length}
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
                      {format(enquiry.submittedAt, 'MMM dd, yyyy')}
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
                    <p className="font-medium text-gray-700">Qualification:</p>
                    <p className="text-gray-600">{enquiry.qualification}</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">Experience:</p>
                    <p className="text-gray-600">{enquiry.experience} years</p>
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-700">Subjects:</p>
                    <p className="text-gray-600">{enquiry.subjects}</p>
                  </div>
                  
                  {enquiry.notes && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Notes:</p>
                      <p className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
                        {enquiry.notes}
                      </p>
                    </div>
                  )}

                  {enquiry.facultyId && (
                    <div className="text-sm">
                      <p className="font-medium text-gray-700">Faculty ID:</p>
                      <div className="flex items-center space-x-2">
                        <code className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                          {enquiry.facultyId}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(enquiry.facultyId!)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t">
                    {enquiry.status === 'pending' ? (
                      <Button
                        onClick={() => handleGenerateFacultyId(enquiry)}
                        disabled={generatingId === enquiry.id}
                        className="w-full"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {generatingId === enquiry.id ? 'Generating...' : 'Generate Faculty ID'}
                      </Button>
                    ) : (
                      <div className="text-center text-sm text-gray-500">
                        Faculty ID has been generated and sent via email
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
          <UserCheck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No enquiries found</h3>
          <p className="text-gray-500">
            {searchTerm || statusFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Faculty enquiries will appear here when submitted'
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
              Faculty ID Generated Successfully!
            </DialogTitle>
            <DialogDescription className="text-gray-600 space-y-3">
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-medium">Faculty ID: 
                  <code className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded">
                    {generatedFacultyId}
                  </code>
                </p>
                <p className="text-sm mt-2">Email sent to: {generatedFacultyEmail}</p>
              </div>
              <p className="text-sm">
                The faculty member has been notified via email with their login credentials.
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