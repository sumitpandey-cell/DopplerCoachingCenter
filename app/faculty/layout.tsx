'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FacultySidebar from '@/components/FacultySidebar';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import {animate, stagger} from 'animejs';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Anime.js animations for topbar
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
        {/* Faculty Topbar */}
        <motion.div 
          className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg border-b border-green-100 dark:border-green-800"
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <motion.div 
            className="font-bold text-xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent faculty-topbar-animate"
            whileHover={{ scale: 1.05 }}
          >
            Faculty Dashboard
          </motion.div>
          <motion.div 
            className="flex items-center gap-3 faculty-topbar-animate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Welcome, <span className="font-semibold text-green-600 dark:text-green-400">{userProfile?.name}</span>
            </div>
          </motion.div>
        </motion.div>
        
        <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
          {children}
        </Suspense>
      </motion.div>
    </div>
  );
}