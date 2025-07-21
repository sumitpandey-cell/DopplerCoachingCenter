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
import { DataLoadingProvider, useDataLoading } from '@/contexts/DataLoadingContext';

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isLoading } = useNavigation();
  const { isDataLoading } = useDataLoading();
  const isPageLoading = isLoading || isDataLoading;

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
          <div className="flex-1 relative min-h-screen">
            {isPageLoading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
                  </div>
                </div>
              </div>
            )}
            <div className="overflow-auto h-full">
            <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
              {children}
            </Suspense>
            </div>
          </div>
        </div>
      </div>
    </SubjectsProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <NavigationProvider>
      <DataLoadingProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
      </DataLoadingProvider>
    </NavigationProvider>
  );
}