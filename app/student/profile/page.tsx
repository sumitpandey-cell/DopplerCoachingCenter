"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Edit, Save, Key, Camera } from 'lucide-react';
import Link from 'next/link';
import { updateStudentProfile } from '@/firebase/firestore';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCurrentStudent } from '../../store';
import type { RootState } from '../../store';

function getInitials(name: string): string {
  return name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';
}

export default function StudentProfilePage() {
  const { userProfile } = useAuth();
  const searchParams = useSearchParams();
  const dispatch = useDispatch();
  const student = useSelector((state: RootState) => state.student.data);
  const studentStatus = useSelector((state: RootState) => state.student.status);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enable edit mode if ?edit=1 is present
  useEffect(() => {
    if (searchParams?.get('edit') === '1') {
      setEditMode(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (studentStatus === 'idle' && userProfile?.studentId) {
      dispatch(fetchCurrentStudent(userProfile.studentId));
    }
  }, [studentStatus, userProfile, dispatch]);

  // Use Redux for current student profile
  // const currentStudent = students.find((s: any) => s.studentId === userProfile?.studentId);

  // Use Redux for display, but keep AuthContext for auth and update
  const [name, setName] = useState(student?.name || userProfile?.name || '');
  const [email] = useState(student?.email || userProfile?.email || '');
  const [phone, setPhone] = useState(student?.phone || (userProfile as any)?.phone || '');

  // Real update logic
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateStudentProfile(userProfile?.uid || '', (userProfile as any)?.studentId || '', { name, phone });
      setSaving(false);
      setEditMode(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
      // Optionally, reload the page or refetch userProfile here for global update
      window.location.reload();
    } catch (err: any) {
      setSaving(false);
      setError('Failed to update profile. Please try again.');
    }
  };

  if (studentStatus === 'loading') {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!student) {
    return <div className="p-8 text-gray-500 dark:text-gray-400">No profile data found.</div>;
  }

  // Format dates
  const createdAt = student.createdAt ? new Date(student.createdAt).toLocaleDateString() : '-';
  const lastLogin = (student as any)?.lastLogin ? new Date((student as any).lastLogin).toLocaleString() : undefined;

  return (
    <div className="p-4 md:p-8 w-full max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">My Profile</h1>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-bold text-blue-700 dark:text-blue-300">
            {student.name ? student.name[0] : '?'}
          </div>
          <div>
            <div className="text-xl font-semibold">{student.name || '-'}</div>
            <div className="text-gray-600 dark:text-gray-400">{student.email || '-'}</div>
            <div className="text-gray-600 dark:text-gray-400">ID: {student.studentId || '-'}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-gray-500 text-sm">Phone</div>
            <div className="font-medium">{student.phone || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Course</div>
            <div className="font-medium">{student.course || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Batch</div>
            <div className="font-medium">{student.batch || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Join Date</div>
            <div className="font-medium">{student.joinDate ? new Date(student.joinDate.seconds ? student.joinDate.seconds * 1000 : student.joinDate).toLocaleDateString() : '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Status</div>
            <div className="font-medium capitalize">{student.status || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
} 