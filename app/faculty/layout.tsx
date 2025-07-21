'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FacultySidebar from '@/components/FacultySidebar';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import {animate, stagger} from 'animejs';
import { DataLoadingProvider, useDataLoading } from '@/contexts/DataLoadingContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';

function FacultyLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const { isDataLoading } = useDataLoading();
  const { isLoading: isNavigating } = useNavigation();
  const isPageLoading = isDataLoading || isNavigating;

  useEffect(() => {
    animate('.square', {
      x: '17rem',
      delay: stagger(100),
      duration: stagger(200, { start: 500 }),
      loop: true,
      alternate: true
    });
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login/faculty');
      } else if (userProfile?.role !== 'faculty') {
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

  if (!user || userProfile?.role !== 'faculty') {
    return null;
  }
  
  return (
    <div className="flex">
      <FacultySidebar />
      <motion.div
        className="flex-1 bg-gray-50 dark:bg-gray-950 relative overflow-auto"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        {isPageLoading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70 backdrop-blur-sm">
            <LoaderOverlay />
          </div>
        )}
        <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
          {children}
        </Suspense>
      </motion.div>
    </div>
  );
}

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <DataLoadingProvider>
        <FacultyLayoutContent>{children}</FacultyLayoutContent>
      </DataLoadingProvider>
    </NavigationProvider>
  );
}