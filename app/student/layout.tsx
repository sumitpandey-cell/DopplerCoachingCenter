'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import StudentSidebar from '@/components/StudentSidebar';
import { LoaderOverlay } from '@/components/ui/loader';
import { useToast } from '@/hooks/use-toast';
import { getNotificationsByStudent, markNotificationAsRead, Notification } from '@/firebase/firestore';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { DataLoadingProvider, useDataLoading } from '@/contexts/DataLoadingContext';
import { NavigationProvider, useNavigation } from '@/contexts/NavigationContext';

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const { toast } = useToast();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const { isDataLoading } = useDataLoading();
  const { isLoading: isNavigating } = useNavigation();
  const isPageLoading = isDataLoading || isNavigating;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('dcc_notifications_on');
      if (stored !== null) setNotificationsOn(stored === 'true');
    }
  }, []);

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

  const handleMarkAsRead = async (id: string) => {
    await markNotificationAsRead(id);
    setNotifications((prev) => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  };

  const toggleNotifications = () => {
    setNotificationsOn((v) => {
      const next = !v;
      localStorage.setItem('dcc_notifications_on', String(next));
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

  return (
    <div className="flex flex-1 min-h-0 h-screen">
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
      <motion.div 
        className="flex-1 bg-gray-50 dark:bg-gray-950 relative overflow-y-auto h-screen"
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
        <div className="md:hidden">
          <FloatingProfileButton userProfile={userProfile} />
        </div>
      </motion.div>
    </div>
  );
}

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavigationProvider>
      <DataLoadingProvider>
        <div className="flex flex-col min-h-screen">
          <StudentLayoutContent>{children}</StudentLayoutContent>
        </div>
      </DataLoadingProvider>
    </NavigationProvider>
  );
}

function FloatingProfileButton({ userProfile }: { userProfile: any }) {
  const router = useRouter();
  return (
    <div
      className="w-full flex flex-col items-center"
    >
      <button
        className="w-11/12 bg-white dark:bg-gray-800 rounded-xl border border-blue-100 dark:border-blue-800 shadow-sm p-2 flex items-center gap-2 cursor-pointer hover:shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition"
        onClick={() => router.push('/student/profile')}
        title="View Profile"
        aria-label="View Profile"
      >
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
      </button>
    </div>
  );
}