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


export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();
  const [dark, setDark] = useState(typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false);
  const [notificationsOn, setNotificationsOn] = useState(true);

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

  const toggleNotifications = () => setNotificationsOn((v) => !v);

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
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-900 shadow z-40 sticky top-0">
        <div className="font-bold text-lg text-blue-700 dark:text-blue-300">Student Portal</div>
        <div className="flex items-center gap-2">
          <button onClick={toggleNotifications} aria-label="Toggle notifications" className={notificationsOn ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'}>
            <Bell className="h-6 w-6" fill={notificationsOn ? 'currentColor' : 'none'} />
          </button>
          <button onClick={toggleDark} aria-label="Toggle dark mode" className="ml-1">
            {dark ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
          </button>
          {/* Profile Dropdown for desktop */}
          <div className="hidden md:block ml-2">
            <ProfileDropdown user={userProfile} />
          </div>
        </div>
      </div>
      <div className="flex flex-1">
        <StudentSidebar />
        <div className="flex-1 bg-gray-50 dark:bg-gray-950 relative">
          <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
          {/* Floating Profile Button for mobile */}
          <div className="md:hidden">
            <FloatingProfileButton userProfile={userProfile} />
          </div>
        </div>
      </div>
    </div>
  );
}

function FloatingProfileButton({ userProfile }: { userProfile: any }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 left-6 z-50">
      <Button
        variant="outline"
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/90 hover:bg-blue-50 border-blue-200"
        onClick={() => setOpen((v) => !v)}
      >
        <User className="h-5 w-5 text-blue-600" />
        <span className="font-semibold text-gray-800">{userProfile?.name || 'Profile'}</span>
      </Button>
      {open && (
        <div className="mt-2 bg-white rounded-xl shadow-xl border border-blue-100 p-4 w-56 animate-fade-in">
          <div className="mb-2 text-gray-700 font-medium">{userProfile?.name}</div>
          <div className="mb-4 text-xs text-gray-500">{userProfile?.email}</div>
          <Link href="/student/profile" className="block text-blue-600 hover:underline mb-2">View Profile</Link>
          <Button variant="destructive" size="sm" className="w-full">Logout</Button>
        </div>
      )}
    </div>
  );
}