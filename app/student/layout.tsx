'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import StudentSidebar from '@/components/StudentSidebar';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login/student');
      } else if (userProfile?.role !== 'student') {
        router.push('/');
      }
    }
  }, [user, userProfile, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || userProfile?.role !== 'student') {
    return null;
  }

  return (
    <div className="flex">
      <StudentSidebar />
      <div className="flex-1 bg-gray-50">
        {children}
      </div>
    </div>
  );
}