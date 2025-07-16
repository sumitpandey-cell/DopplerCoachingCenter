'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { getStudentEnrollments, dropSubject, getEnrollmentAudit, StudentEnrollment, Subject, EnrollmentAudit } from '@/firebase/subjects';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Clock, Users, MapPin, Calendar, Trash2, History, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentEnrollmentOverview() {
  const { userProfile } = useAuth();
  const [enrollments, setEnrollments] = useState<(StudentEnrollment & { subject: Subject })[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);
  const [auditTrail, setAuditTrail] = useState<EnrollmentAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDropDialog, setShowDropDialog] = useState(false);
  const [showAuditDialog, setShowAuditDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<(StudentEnrollment & { subject: Subject }) | null>(null);
  const [dropReason, setDropReason] = useState('');
  const [dropping, setDropping] = useState(false);
  const [dropResult, setDropResult] = useState<{ success: boolean; error?: string } | null>(null);

  useEffect(() => {
    if (userProfile?.studentId) {
      loadEnrollments();
      loadAuditTrail();
    }
  }, [userProfile]);

  const loadEnrollments = async () => {
    try {
      const result = await getStudentEnrollments(userProfile!.studentId!);
      setEnrollments(result.enrollments);
      setTotalCredits(result.totalCredits);
    } catch (error) {
      console.error('Error loading enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuditTrail = async () => {
    try {
      const audit = await getEnrollmentAudit(userProfile!.studentId!);
      setAuditTrail(audit);
    } catch (error) {
      console.error('Error loading audit trail:', error);
    }
  };

  const handleDropSubject = async () => {
    if (!selectedSubject) return;

    setDropping(true);
    try {
      const result = await dropSubject(
        userProfile!.studentId!,
        selectedSubject.subjectId,
        dropReason
      );
      
      setDropResult(result);
      
      if (result.success) {
        await loadEnrollments();
        await loadAuditTrail();
        setShowDropDialog(false);
        setDropReason('');
        setSelectedSubject(null);
      }
    } catch (error) {
      console.error('Error dropping subject:', error);
      setDropResult({ success: false, error: 'Failed to drop subject' });
    } finally {
      setDropping(false);
    }
  };

  const canDropSubject = (subject: Subject): boolean => {
    const now = new Date();
    return now <= subject.addDropDeadline;
  };

  const getScheduleDisplay = (schedule: Subject['schedule']) => {
    return schedule.map(s => `${s.day} ${s.startTime}-${s.endTime} (${s.room})`).join(', ');
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'enroll':
        return <Badge className="bg-green-100 text-green-800">Enrolled</Badge>;
      case 'drop':
        return <Badge className="bg-red-100 text-red-800">Dropped</Badge>;
      case 'complete':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{action}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 mr-2" />
              My Enrollments
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuditDialog(true)}
            >
              <History className="h-4 w-4 mr-2" />
              View History
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{enrollments.length}</div>
              <div className="text-sm text-blue-800">Enrolled Subjects</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalCredits}</div>
              <div className="text-sm text-green-800">Total Credits</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {enrollments.filter(e => canDropSubject(e.subject)).length}
              </div>
              <div className="text-sm text-purple-800">Can Drop</div>
            </div>
          </div>

          {dropResult && (
            <Alert className={`mb-4 ${dropResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center">
                {dropResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  {dropResult.success ? (
                    <span className="text-green-800">Subject dropped successfully!</span>
                  ) : (
                    <span className="text-red-800">{dropResult.error}</span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {enrollments.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Current Enrollments</h3>
              <p className="text-gray-500">
                You haven't enrolled in any subjects yet. Visit the enrollment page to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{enrollment.subject.name}</h3>
                      <p className="text-sm text-gray-600">{enrollment.subject.code}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{enrollment.credits} Credits</Badge>
                      <Badge variant="default">Enrolled</Badge>
                      {canDropSubject(enrollment.subject) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedSubject(enrollment);
                            setShowDropDialog(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Drop
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{enrollment.subject.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-600">
                      <Users className="h-4 w-4 mr-2" />
                      Faculty: {enrollment.subject.faculty}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Clock className="h-4 w-4 mr-2" />
                      {getScheduleDisplay(enrollment.subject.schedule)}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Enrolled: {enrollment.enrollmentDate.toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Drop Deadline: {enrollment.subject.addDropDeadline.toLocaleDateString()}
                    </div>
                  </div>
                  
                  {!canDropSubject(enrollment.subject) && (
                    <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                      Add/drop deadline has passed for this subject
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Drop Subject Dialog */}
      <Dialog open={showDropDialog} onOpenChange={setShowDropDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Drop Subject</DialogTitle>
            <DialogDescription>
              Are you sure you want to drop {selectedSubject?.subject.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Subject Details:</h4>
              <p><strong>Name:</strong> {selectedSubject?.subject.name}</p>
              <p><strong>Code:</strong> {selectedSubject?.subject.code}</p>
              <p><strong>Credits:</strong> {selectedSubject?.credits}</p>
            </div>
            <div>
              <Label htmlFor="dropReason">Reason for dropping (optional)</Label>
              <Textarea
                id="dropReason"
                value={dropReason}
                onChange={(e) => setDropReason(e.target.value)}
                placeholder="Enter reason for dropping this subject..."
                rows={3}
              />
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDropDialog(false);
                  setDropReason('');
                  setSelectedSubject(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDropSubject}
                disabled={dropping}
                className="flex-1"
              >
                {dropping ? 'Dropping...' : 'Drop Subject'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit Trail Dialog */}
      <Dialog open={showAuditDialog} onOpenChange={setShowAuditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enrollment History</DialogTitle>
            <DialogDescription>
              Complete history of your enrollment activities
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            {auditTrail.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No enrollment history found</p>
            ) : (
              <div className="space-y-3">
                {auditTrail.map((audit) => (
                  <div key={audit.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="flex items-center space-x-2">
                        {getActionBadge(audit.action)}
                        <span className="font-medium">Subject ID: {audit.subjectId}</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {audit.timestamp.toLocaleDateString()} at {audit.timestamp.toLocaleTimeString()}
                      </p>
                      {audit.reason && (
                        <p className="text-sm text-gray-600">Reason: {audit.reason}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}