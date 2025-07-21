'use client';

import { useState, useEffect, useCallback, useMemo, memo, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Calendar, Bell, TrendingUp, FileText, DollarSign, ChevronDown, Menu, X, User, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/firebase/auth";
import { cn } from "@/lib/utils";
import type { Variants } from 'framer-motion';
import { useNavigation } from '@/contexts/NavigationContext';

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard, color: "text-blue-500" },
  { name: "Study Materials", href: "/student/materials", icon: BookOpen, color: "text-green-500" },
  { name: "Timetable", href: "/student/timetable", icon: Calendar, color: "text-purple-500" },
  { name: "Performance", href: "/student/performance", icon: TrendingUp, color: "text-orange-500" },
  { name: "Test Results", href: "/student/tests", icon: FileText, color: "text-red-500" },
  { name: "Announcements", href: "/student/announcements", icon: Bell, color: "text-yellow-500" },
  {
    name: "Payments",
    icon: DollarSign,
    color: "text-emerald-500",
    children: [
      { name: "Overview", href: "/student/fees", icon: DollarSign, color: "text-emerald-500" },
      { name: "Payment History", href: "/student/fees/payments", icon: FileText, color: "text-blue-500" },
    ],
  },
  { name: "Subject Enrollment", href: "/student/subjects", icon: BookOpen, color: "text-indigo-500" },
];

// Optimized navigation item with immediate visual feedback
const NavigationItem = memo(({ 
  item, 
  isActive, 
  onNavigate,
  isPending 
}: { 
  item: any; 
  isActive: boolean; 
  onNavigate: (href: string) => void; 
  isPending: boolean;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) return;
    setIsClicked(true);
    onNavigate(item.href);
    setTimeout(() => setIsClicked(false), 300);
  }, [item.href, onNavigate, isActive]);
  
  return (
    <Link
      href={item.href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group relative overflow-hidden w-full text-left',
        isActive || isClicked
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300 hover:scale-[1.01]'
      )}
    >
      <motion.div
        className={cn('p-2 rounded-lg shadow-sm transition-all', isActive || isClicked ? 'bg-white/20' : 'bg-white dark:bg-gray-800 group-hover:shadow-md')}
        whileHover={{ rotate: 5, scale: 1.1 }}
      >
        <item.icon className={cn('h-4 w-4', isActive || isClicked ? 'text-white' : item.color)} aria-hidden="true" />
      </motion.div>
      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
      {(isActive || isClicked) && (
        <motion.div
          className="ml-auto w-2 h-2 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          aria-hidden="true"
        />
      )}
      {isPending && isClicked && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-50 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const ChildNavigationItem = memo(({ 
  child, 
  isActive, 
  onNavigate,
  isPending 
}: { 
  child: any; 
  isActive: boolean; 
  onNavigate: (href: string) => void; 
  isPending: boolean;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if (isActive) return;
    setIsClicked(true);
    onNavigate(child.href);
    setTimeout(() => setIsClicked(false), 300);
  }, [child.href, onNavigate, isActive]);
  
  return (
    <Link
      href={child.href}
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-150 w-full text-left relative overflow-hidden',
        isActive || isClicked
          ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300'
      )}
    >
      <motion.div
        className={cn('p-1.5 rounded-md shadow-sm', isActive || isClicked ? 'bg-white/20' : 'bg-white dark:bg-gray-800')}
        whileHover={{ scale: 1.1 }}
      >
        <child.icon className={cn('h-3 w-3', isActive || isClicked ? 'text-white' : child.color)} aria-hidden="true" />
      </motion.div>
      <span>{child.name}</span>
      {isPending && isClicked && (
        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-50 flex items-center justify-center">
          <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
    </Link>
  );
});

ChildNavigationItem.displayName = 'ChildNavigationItem';

// Fix framer-motion Variants types
const sidebarVariants: Variants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
  closed: {
    x: -280,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

const itemVariants: Variants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24
    }
  },
  closed: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

const overlayVariants: Variants = {
  open: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

// Add props for notification, dark mode, and profile button
interface StudentSidebarProps {
  notificationsOn: boolean;
  unreadCount: number;
  showNotifications: boolean;
  setShowNotifications: React.Dispatch<React.SetStateAction<boolean>>;
  notifLoading: boolean;
  notifications: any[];
  handleMarkAsRead: (id: string) => void;
  toggleDark: () => void;
  dark: boolean;
  userProfile: any;
  profileButtonComponent: React.ReactNode;
}

export default function StudentSidebar({
  notificationsOn,
  unreadCount,
  showNotifications,
  setShowNotifications,
  notifLoading,
  notifications,
  handleMarkAsRead,
  toggleDark,
  dark,
  userProfile,
  profileButtonComponent
}: StudentSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile: authUserProfile } = useAuth(); // Renamed to avoid conflict with prop
  const { setIsLoading } = useNavigation();

  // Fix linter error: setCurrentPath(pathname || "");
  useEffect(() => {
    setCurrentPath(pathname || "");
  }, [pathname]);

  // Memoize mobile check to prevent unnecessary re-renders
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) {
      setIsOpen(true);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  useEffect(() => {
    const allRoutes = navigation.flatMap(item => item.children ? item.children.map(child => child.href) : [item.href]);
    allRoutes.forEach(href => {
      if(href) router.prefetch(href);
    });
  }, [router]);

  // Optimized navigation handler with loading overlay
  const handleNavigation = useCallback((href: string) => {
    setCurrentPath(href);
    setIsLoading(true);
    startTransition(() => {
      router.push(href);
      if (isMobile) {
        setIsOpen(false);
      }
    });
  }, [router, isMobile, setIsLoading]);

  // When pathname changes, remove loading overlay
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, setIsLoading]);

  // Memoized toggle function
  const toggleGroup = useCallback((name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  }, []);

  // Optimized logout handler
  const handleLogout = useCallback(async () => {
    startTransition(async () => {
      try {
        await signOut();
        router.push('/login/student');
      } catch (err) {
        console.error('Logout failed:', err);
      }
    });
  }, [router]);

  // Memoized active state checker
  const isActive = useCallback((href: string) => currentPath === href, [currentPath]);

  // Memoized mobile toggle
  const toggleMobile = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div 
        className="lg:hidden fixed top-4 left-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobile}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-controls="student-sidebar"
          aria-expanded={isOpen}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-200 hover:bg-blue-50"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>


      <motion.aside
        id="student-sidebar"
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gradient-to-b from-white via-blue-50/30 to-white 
          dark:from-gray-900 dark:via-blue-950/30 dark:to-gray-900 
          border-r border-blue-100 dark:border-blue-800 shadow-xl z-40
          flex flex-col h-full overflow-hidden
        `}
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        style={{ width: "280px" }}
      >
        {/* Profile Box at Top */}
        <div className="w-full flex justify-center mt-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow p-4 flex flex-col items-center w-11/12">
            {profileButtonComponent}
          </div>
        </div>

        {/* Navigation */}
        <motion.nav 
          className="flex-1 p-4 overflow-y-auto" 
          variants={itemVariants} 
          role="navigation" 
          aria-label="Student Navigation"
        >
          <div className="space-y-2">
            {navigation.map((item, index) =>
              item.children ? (
                <motion.div 
                  key={item.name} 
                  className="space-y-1"
                  variants={itemVariants}
                  custom={index}
                >
                  <motion.button
                    onClick={() => toggleGroup(item.name)}
                    aria-expanded={openGroups[item.name] || false}
                    aria-controls={`student-sidebar-panel-${item.name.replace(/\s+/g, '-')}`}
                    className={cn(
                      'flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                      'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:scale-[1.01]'
                    )}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={cn(
                          'p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow',
                          item.color
                        )}
                        whileHover={{ rotate: 5 }}
                      >
                        <item.icon className="h-4 w-4" aria-hidden="true" />
                      </motion.div>
                      <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: openGroups[item.name] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openGroups[item.name] && (
                      <motion.div
                        id={`student-sidebar-panel-${item.name.replace(/\s+/g, '-')}`}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="ml-6 space-y-1 overflow-hidden"
                      >
                        {item.children.map((child, childIndex) => (
                          <motion.div
                            key={child.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: childIndex * 0.1 }}
                          >
                            <ChildNavigationItem
                              child={child}
                              isActive={isActive(child.href)}
                              onNavigate={handleNavigation} // <-- ensure this is handleNavigation
                              isPending={isPending}
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  custom={index}
                >
                  <NavigationItem
                    item={item}
                    isActive={isActive(item.href)}
                    onNavigate={handleNavigation}
                    isPending={isPending}
                  />
                </motion.div>
              )
            )}
          </div>
        </motion.nav>
        {/* Footer: Notification, Dark Mode, Logout in a row */}
        <div className="flex flex-row items-center justify-center gap-4 p-4 border-t border-blue-100 dark:border-blue-800">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Show notifications"
              className="p-2 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
            >
              <Bell className={notificationsOn ? 'text-blue-600' : 'text-gray-400 dark:text-gray-500'} fill={notificationsOn ? 'currentColor' : 'none'} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute left-12 top-0 z-50 w-80 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-blue-100 dark:border-blue-800 p-4">
                <div className="font-bold text-blue-700 dark:text-blue-300 mb-2">Notifications</div>
                <div className="max-h-64 overflow-y-auto">
                  {notifLoading ? (
                    <div className="text-center text-gray-500">Loading...</div>
                  ) : notifications.length === 0 ? (
                    <div className="text-center text-gray-500">No notifications yet.</div>
                  ) : notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`rounded-lg p-3 border flex flex-col gap-1 cursor-pointer transition bg-white dark:bg-gray-900 ${notif.isRead ? 'opacity-70' : 'border-blue-300 bg-blue-50 dark:bg-blue-950'}`}
                      onClick={() => handleMarkAsRead(notif.id!)}
                    >
                      <div className="flex items-center gap-2">
                        {!notif.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                        <span className="font-semibold text-gray-900 dark:text-gray-100">{notif.title}</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{notif.description}</div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="mt-2 w-full py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="h-6 w-6 text-yellow-400" /> : <Moon className="h-6 w-6 text-gray-700 dark:text-gray-200" />}
          </button>
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
            disabled={isPending}
            aria-label="Logout"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </motion.aside>
    </>
  );
}