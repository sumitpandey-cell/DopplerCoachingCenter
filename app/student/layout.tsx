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
import anime from 'animejs';


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
    anime({
      targets: '.topbar-animate',
      translateY: [-20, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutExpo',
      delay: anime.stagger(100)
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

  return (
    <div className="flex flex-col min-h-screen">
      {/* Topbar */}
      <motion.div 
        className="flex items-center justify-between px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-lg z-40 sticky top-0 border-b border-blue-100 dark:border-blue-800"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <motion.div 
          className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent topbar-animate"
          whileHover={{ scale: 1.05 }}
        >
          Student Portal
        </motion.div>
        <div className="flex items-center gap-3">
          <motion.button 
            onClick={() => setShowNotifications((v) => !v)} 
            aria-label="Show notifications" 
            className="relative p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors topbar-animate"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell className={notificationsOn ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'} fill={notificationsOn ? 'currentColor' : 'none'} />
            {unreadCount > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {unreadCount}
              </motion.span>
            )}
          </motion.button>
          <motion.button 
            onClick={toggleDark} 
            aria-label="Toggle dark mode" 
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors topbar-animate"
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
          >
            {dark ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
          </motion.button>
          {/* Profile Dropdown for desktop */}
          <motion.div 
            className="hidden md:block ml-2 topbar-animate"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ProfileDropdown user={userProfile} />
          </motion.div>
        </div>
      </motion.div>
      {/* Notification Dropdown (top right, animated) */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-20 right-4 z-[100] w-full max-w-sm bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-800 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gradient-to-r from-blue-500 to-indigo-500">
              <span className="font-bold text-blue-700 dark:text-blue-300 text-lg">Notifications</span>
              <motion.button 
                onClick={() => setShowNotifications(false)} 
                aria-label="Close notifications" 
                className="text-white hover:text-gray-200 text-xl p-1 rounded-lg hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ×
              </motion.button>
            </div>
            <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
              {notifLoading ? (
                <div className="text-center text-gray-500">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center text-gray-500">No notifications yet.</div>
              ) : notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  className={`rounded-lg p-3 border flex flex-col gap-1 cursor-pointer transition bg-white dark:bg-gray-900 ${notif.isRead ? 'opacity-70' : 'border-blue-300 bg-blue-50 dark:bg-blue-950'}`}
                  onClick={() => handleMarkAsRead(notif.id!)}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                >
                  <div className="flex items-center gap-2">
                    {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{notif.title}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">{notif.description}</div>
                  <div className="text-xs text-gray-400 mt-1">{formatDistanceToNow(notif.createdAt, { addSuffix: true })}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex flex-1">
        <StudentSidebar />
        <motion.div 
          className="flex-1 bg-gray-50 dark:bg-gray-950 relative"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
          {/* Floating Profile Button for mobile */}
          <div className="md:hidden">
            <FloatingProfileButton userProfile={userProfile} />
          </div>
        </motion.div>
      </div>
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
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/90 hover:bg-blue-50 border-blue-200 backdrop-blur-sm"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-800">{userProfile?.name || 'Profile'}</span>
      </Button>
      </motion.div>
      <AnimatePresence>
      {open && (
        <motion.div 
          className="mt-2 bg-white/95 backdrop-blur-md rounded-xl shadow-xl border border-blue-100 p-4 w-56"
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        >
          <div className="mb-2 text-gray-700 font-medium">{userProfile?.name}</div>
          <div className="mb-4 text-xs text-gray-500">{userProfile?.email}</div>
          <motion.div whileHover={{ x: 4 }}>
            <Link href="/student/profile" className="block text-blue-600 hover:underline mb-2">View Profile</Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button variant="destructive" size="sm" className="w-full">Logout</Button>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </motion.div>
  );
}