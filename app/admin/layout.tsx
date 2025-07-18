'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/firebase/admin-auth';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { SubjectsProvider } from '@/contexts/SubjectsContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SubjectsProvider>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950">
          <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
        </div>
      </div>
    </SubjectsProvider>
  );
}