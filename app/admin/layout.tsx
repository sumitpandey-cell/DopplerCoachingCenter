'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAdminAuthenticated } from '@/firebase/admin-auth';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import AdminSidebar from '@/components/AdminSidebar';
import { SubjectsProvider } from '@/contexts/SubjectsContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';
import { Loader2 } from 'lucide-react';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isLoading } = useNavigation();

  useEffect(() => {
    if (!isAdminAuthenticated()) {
      router.push('/');
      return;
    }
    setLoading(false);
  }, []); // Only run once on mount

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <SubjectsProvider>
      <div className="flex h-screen">
        <AdminSidebar />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-950 relative">
            {/* Loading overlay when navigating */}
            {isLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Loading...</p>
                </div>
              </div>
            )}
            <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
              {children}
            </Suspense>
          </div>
        </div>
      </div>
    </SubjectsProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </NavigationProvider>
  );
}