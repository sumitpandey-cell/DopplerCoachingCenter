'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { getAvailableSubjects, enrollStudentInSubjects, Subject } from '@/firebase/subjects';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Clock, Users, MapPin, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface SubjectEnrollmentFormProps {
  maxEnrollmentLimit?: number;
  onEnrollmentComplete?: () => void;
}

export default function SubjectEnrollmentForm({ 
  maxEnrollmentLimit = 6, 
  onEnrollmentComplete 
}: SubjectEnrollmentFormProps) {
  const { userProfile } = useAuth();
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [enrollmentResult, setEnrollmentResult] = useState<{
    success: boolean;
    errors: string[];
    enrolledSubjects: string[];
  } | null>(null);

  useEffect(() => {
    if (userProfile?.studentId) {
      loadAvailableSubjects();
    }
  }, [userProfile]);

  const loadAvailableSubjects = async () => {
    try {
      const subjects = await getAvailableSubjects(userProfile!.studentId!);
      setAvailableSubjects(subjects);
    } catch (error) {
      console.error('Error loading subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subjectId: string) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleEnrollment = async () => {
    if (!userProfile?.studentId || selectedSubjects.length === 0) return;

    setEnrolling(true);
    try {
      const result = await enrollStudentInSubjects(
        userProfile.studentId,
        selectedSubjects,
        maxEnrollmentLimit
      );
      
      setEnrollmentResult(result);
      setShowConfirmDialog(false);
      
      if (result.success) {
        setSelectedSubjects([]);
        await loadAvailableSubjects();
        onEnrollmentComplete?.();
      }
    } catch (error) {
      console.error('Error enrolling in subjects:', error);
      setEnrollmentResult({
        success: false,
        errors: ['Failed to process enrollment'],
        enrolledSubjects: []
      });
    } finally {
      setEnrolling(false);
    }
  };

  const getTotalCredits = () => {
    return selectedSubjects.reduce((total, subjectId) => {
      const subject = availableSubjects.find(s => s.id === subjectId);
      return total + (subject?.credits || 0);
    }, 0);
  };

  const getScheduleDisplay = (schedule: Subject['schedule']) => {
    return schedule.map(s => `${s.day} ${s.startTime}-${s.endTime}`).join(', ');
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            Subject Enrollment
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Select subjects to enroll in (Maximum: {maxEnrollmentLimit})
            </p>
            {selectedSubjects.length > 0 && (
              <div className="text-sm">
                <span className="font-medium">Selected: {selectedSubjects.length}</span>
                <span className="text-gray-500 ml-2">Credits: {getTotalCredits()}</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {enrollmentResult && (
            <Alert className={`mb-4 ${enrollmentResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
              <div className="flex items-center">
                {enrollmentResult.success ? (
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                )}
                <AlertDescription>
                  {enrollmentResult.success ? (
                    <div>
                      <p className="font-medium text-green-800">Enrollment Successful!</p>
                      <p className="text-green-700">
                        Successfully enrolled in {enrollmentResult.enrolledSubjects.length} subject(s).
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium text-red-800">Enrollment Issues:</p>
                      <ul className="list-disc list-inside text-red-700">
                        {enrollmentResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {availableSubjects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Available Subjects</h3>
              <p className="text-gray-500">
                All subjects are either full, past enrollment deadline, or you're already enrolled.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {availableSubjects.map((subject) => (
                <div
                  key={subject.id}
                  className={`border rounded-lg p-4 transition-colors ${
                    selectedSubjects.includes(subject.id)
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      checked={selectedSubjects.includes(subject.id)}
                      onCheckedChange={() => handleSubjectToggle(subject.id)}
                      disabled={selectedSubjects.length >= maxEnrollmentLimit && !selectedSubjects.includes(subject.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-lg">{subject.name}</h3>
                          <p className="text-sm text-gray-600">{subject.code}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">{subject.credits} Credits</Badge>
                          <Badge variant={subject.currentEnrollment >= subject.maxCapacity * 0.8 ? 'destructive' : 'secondary'}>
                            {subject.currentEnrollment}/{subject.maxCapacity}
                          </Badge>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 mb-3">{subject.description}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center text-gray-600">
                          <Users className="h-4 w-4 mr-2" />
                          Faculty: {subject.faculty}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Clock className="h-4 w-4 mr-2" />
                          {getScheduleDisplay(subject.schedule)}
                        </div>
                        <div className="flex items-center text-gray-600">
                          <Calendar className="h-4 w-4 mr-2" />
                          Deadline: {subject.addDropDeadline.toLocaleDateString()}
                        </div>
                        {subject.prerequisites.length > 0 && (
                          <div className="flex items-center text-gray-600">
                            <BookOpen className="h-4 w-4 mr-2" />
                            Prerequisites: {subject.prerequisites.length} required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedSubjects.length > 0 && (
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedSubjects.length} subject(s) selected • {getTotalCredits()} total credits
                  </p>
                  <p className="text-sm text-gray-600">
                    Review your selections before enrolling
                  </p>
                </div>
                <Button
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={enrolling}
                  className="px-6"
                >
                  {enrolling ? 'Enrolling...' : 'Enroll in Selected Subjects'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Enrollment</DialogTitle>
            <DialogDescription>
              Please review your subject selections before confirming enrollment.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Selected Subjects:</h4>
              <div className="space-y-2">
                {selectedSubjects.map(subjectId => {
                  const subject = availableSubjects.find(s => s.id === subjectId);
                  return subject ? (
                    <div key={subjectId} className="flex justify-between items-center">
                      <span>{subject.name} ({subject.code})</span>
                      <span className="text-sm text-gray-600">{subject.credits} credits</span>
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between font-medium">
                  <span>Total Credits:</span>
                  <span>{getTotalCredits()}</span>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnrollment}
                disabled={enrolling}
                className="flex-1"
              >
                {enrolling ? 'Processing...' : 'Confirm Enrollment'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}