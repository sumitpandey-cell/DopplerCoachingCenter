'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { User, Moon, Sun, Bell } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import DashboardCards from '@/components/DashboardCards';
import RecentTestResults from '@/components/RecentTestResults';
import QuickActions from '@/components/QuickActions';
import ProfileDropdown from '@/components/ProfileDropdown';
import StudentSidebar from '@/components/StudentSidebar';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from '@/components/ui/drawer';
import { getNotificationsByStudent, markNotificationAsRead, Notification } from '@/firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { animate, stagger } from 'animejs';
import { DataLoadingProvider, useDataLoading } from '@/contexts/DataLoadingContext';
import { NavigationProvider } from '@/contexts/NavigationContext';

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

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

  // Load notification preference from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dcc_notifications_on');
      if (stored !== null) setNotificationsOn(stored === 'true');
    }
  }, []);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (userProfile?.studentId) {
        setNotifLoading(true);
        const notifs = await getNotificationsByStudent(userProfile.studentId);
        setNotifications(notifs);
        setNotifLoading(false);
      }
    };
    if (showNotifications) fetchNotifications();
  }, [showNotifications, userProfile]);

  // Mark as read
  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const toggleNotifications = () => {
    setNotificationsOn((v) => {
      const next = !v;
      if (typeof window !== 'undefined') {
        localStorage.setItem('dcc_notifications_on', String(next));
      }
      toast({
        title: next ? 'Notifications Enabled' : 'Notifications Disabled',
        description: next
          ? 'You will receive important updates and alerts.'
          : 'You will not receive notifications until re-enabled.',
      });
      return next;
    });
  };

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

  // Wrap the layout in DataLoadingProvider
  return (
    <NavigationProvider>
      <div className="flex flex-col min-h-screen">
        <div className="flex flex-1 min-h-0 h-screen">
          <div className="w-64 h-screen bg-white dark:bg-gray-900 border-r border-blue-100 dark:border-blue-800">
            <StudentSidebar
              notificationsOn={notificationsOn}
              unreadCount={unreadCount}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
              notifLoading={notifLoading}
              notifications={notifications}
              handleMarkAsRead={handleMarkAsRead}
              toggleDark={toggleDark}
              dark={dark}
              userProfile={userProfile}
              profileButtonComponent={<FloatingProfileButton userProfile={userProfile} />}
            />
          </div>
          <DataLoadingProvider>
            <ContentWithOverlay userProfile={userProfile}>{children}</ContentWithOverlay>
          </DataLoadingProvider>
        </div>
      </div>
    </NavigationProvider>
  );
}

function ContentWithOverlay({ children, userProfile }: { children: React.ReactNode, userProfile: any }) {
  const { isDataLoading } = useDataLoading();
  return (
    <motion.div 
      className="flex-1 bg-gray-50 dark:bg-gray-950 relative overflow-y-auto h-screen"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      {isDataLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70">
          <LoaderOverlay />
        </div>
      )}
      <Suspense fallback={<div className='absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-950/70'><LoaderOverlay /></div>}>
        {children}
      </Suspense>
      {/* Floating Profile Button for mobile */}
      <div className="md:hidden">
        <FloatingProfileButton userProfile={userProfile} />
      </div>
    </motion.div>
  );
}

function FloatingProfileButton({ userProfile }: { userProfile: any }) {
  const router = useRouter();
  return (
    <div
      className="w-full flex flex-col items-center"
    >
      <div
        className="w-11/12 bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm p-2 flex items-center gap-2 cursor-pointer hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
        onClick={() => router.push('/student/profile')}
        title="View Profile"
      >
        {/* Avatar or Initials */}
        {userProfile?.photoUrl ? (
          <img
            src={userProfile.photoUrl}
            alt="avatar"
            className="h-8 w-8 rounded-full object-cover border-2 border-blue-200 dark:border-blue-700 shadow"
          />
        ) : (
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-base font-bold border-2 border-blue-200 dark:border-blue-700 shadow">
            {userProfile?.name?.[0]?.toUpperCase() || 'U'}
          </span>
        )}
        <div className="flex flex-col justify-center min-w-0">
          <span className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
            {userProfile?.name || 'Profile'}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {userProfile?.studentId || userProfile?.email || ''}
          </span>
        </div>
      </div>
    </div>
  );
}