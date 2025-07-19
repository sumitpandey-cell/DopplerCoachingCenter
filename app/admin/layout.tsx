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
        <div className="flex flex-1 min-h-0" style={{height: 'calc(100vh - 64px)'}}>
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 h-full relative">
            <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </SubjectsProvider>
  );
}