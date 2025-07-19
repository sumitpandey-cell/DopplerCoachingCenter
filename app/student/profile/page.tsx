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
  const { userProfile, loading, user } = useAuth();
  const searchParams = useSearchParams();
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(userProfile?.name || '');
  const [email] = useState(userProfile?.email || '');
  const [phone, setPhone] = useState((userProfile as any)?.phone || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Enable edit mode if ?edit=1 is present
  useEffect(() => {
    if (searchParams?.get('edit') === '1') {
      setEditMode(true);
    }
  }, [searchParams]);

  // Real update logic
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateStudentProfile(user?.uid || '', (userProfile as any)?.studentId || '', { name, phone });
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="animate-spin h-10 w-10 text-blue-600" />
      </div>
    );
  }

  if (!userProfile) {
    return <div className="text-center py-12 text-gray-500">Profile not found.</div>;
  }

  // Format dates
  const createdAt = userProfile.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '-';
  const lastLogin = (userProfile as any)?.lastLogin ? new Date((userProfile as any).lastLogin).toLocaleString() : undefined;

  return (
    <div className="p-4 md:p-8 w-full flex justify-center">
      <Card className="w-full max-w-xl shadow-xl border border-blue-100 dark:border-blue-800 bg-white dark:bg-gray-950 p-0">
        <CardHeader className="flex flex-col items-center gap-2 pt-8 pb-4">
          {/* Avatar with upload icon */}
          <div className="relative group mb-2">
            {(userProfile as any)?.photoUrl ? (
              <img
                src={(userProfile as any).photoUrl}
                alt="avatar"
                className="h-20 w-20 rounded-full object-cover border-4 border-blue-200 dark:border-blue-700 shadow"
              />
            ) : (
              <span className="h-20 w-20 rounded-full bg-blue-500 text-white flex items-center justify-center text-3xl font-bold border-4 border-blue-200 dark:border-blue-700 shadow">
                {getInitials(userProfile.name)}
              </span>
            )}
            {/* Upload icon (not functional, for UI) */}
            <button
              className="absolute bottom-1 right-1 bg-white dark:bg-gray-800 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow group-hover:scale-110 transition"
              title="Upload photo"
              tabIndex={-1}
            >
              <Camera className="h-5 w-5 text-blue-600 dark:text-blue-300" />
            </button>
          </div>
          <CardTitle className="text-2xl font-bold text-blue-700 dark:text-blue-300">My Profile</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</label>
              {editMode ? (
                <Input value={name} onChange={e => setName(e.target.value)} className="max-w-xs" />
              ) : (
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{userProfile.name}</div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Email</label>
              <div className="text-base font-semibold text-gray-900 dark:text-gray-100 break-all">{email}</div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Role</label>
              <div className="inline-block px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                {userProfile.role}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              {editMode ? (
                <Input value={phone} onChange={e => setPhone(e.target.value)} className="max-w-xs" />
              ) : (
                <div className="text-base font-semibold text-gray-900 dark:text-gray-100">{phone ? phone : <span className="italic text-gray-400">Not set</span>}</div>
              )}
            </div>
            {(lastLogin !== undefined) && (
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Last Login</label>
                <div className="text-base text-gray-700 dark:text-gray-300">{lastLogin}</div>
              </div>
            )}
            <div>
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Account Created</label>
              <div className="text-base text-gray-700 dark:text-gray-300">{createdAt}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-4">
            {editMode ? (
              <Button onClick={handleSave} disabled={saving} className="flex items-center gap-2">
                {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <Save className="h-4 w-4" />} Save
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setEditMode(true)} className="flex items-center gap-2">
                <Edit className="h-4 w-4" /> Edit
              </Button>
            )}
            <Link href="/student/profile/password" className="flex items-center gap-2 text-blue-600 hover:underline text-sm">
              <Key className="h-4 w-4" /> Change Password
            </Link>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
          {success && <div className="text-green-600 text-sm mt-2">Profile updated successfully!</div>}
        </CardContent>
      </Card>
    </div>
  );
} 