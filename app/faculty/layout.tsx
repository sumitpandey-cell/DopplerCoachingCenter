'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import FacultySidebar from '@/components/FacultySidebar';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { motion } from 'framer-motion';
import anime from 'animejs';

export default function FacultyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  // Anime.js animations for topbar
  useEffect(() => {
    anime({
      targets: '.faculty-topbar-animate',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutExpo',
      delay: anime.stagger(100)
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
        className="flex-1 bg-gray-50 dark:bg-gray-950"
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
        
        <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
        {/* Floating Profile Button */}
        <FloatingProfileButton userProfile={userProfile} />
      </motion.div>
    </div>
  );
}

function FloatingProfileButton({ userProfile }: { userProfile: any }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div 
      className="fixed bottom-6 left-6 z-50"
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/90 hover:bg-green-50 border-green-200 backdrop-blur-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-5 w-5 text-green-600" />
        <span className="font-semibold text-gray-800">{userProfile?.name || 'Profile'}</span>
      </Button>
      </motion.div>
      {open && (
        <motion.div 
          className="mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-green-100 p-4 w-56"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div className="mb-2 text-gray-700 font-medium">{userProfile?.name}</div>
          <div className="mb-4 text-xs text-gray-500">{userProfile?.email}</div>
          <motion.div whileHover={{ x: 4 }}>
            <Link href="/faculty/profile" className="block text-green-600 hover:underline mb-2">View Profile</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="destructive" size="sm" className="w-full">Logout</Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}