'use client';

import React, { useState, useEffect, useCallback, memo, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/firebase/auth';
import { 
  LayoutDashboard, 
  Users, 
  Upload, 
  Calendar, 
  Bell, 
  ClipboardList,
  Menu,
  X,
  LogOut,
  User
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard, color: 'text-blue-500' },
  { name: 'Students', href: '/faculty/students', icon: Users, color: 'text-green-500' },
  { name: 'Upload Materials', href: '/faculty/upload-materials', icon: Upload, color: 'text-purple-500' },
  { name: 'Schedule Tests', href: '/faculty/schedule-tests', icon: Calendar, color: 'text-orange-500' },
  { name: 'Enter Scores', href: '/faculty/enter-scores', icon: ClipboardList, color: 'text-red-500' },
  { name: 'Announcements', href: '/faculty/post-announcements', icon: Bell, color: 'text-yellow-500' },
];

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
  const Icon = item.icon;
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    if(isActive) return;
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
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative overflow-hidden',
        isActive || isClicked
          ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg transform scale-105'
          : 'text-gray-600 dark:text-gray-300 hover:bg-green-50 dark:hover:bg-green-900/50 hover:text-green-700 dark:hover:text-green-300'
      )}
    >
      <motion.div
        className={cn(
          'p-2 rounded-lg shadow-sm transition-all',
          isActive || isClicked ? 'bg-white/20' : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
        )}
        whileHover={{ rotate: 5, scale: 1.1 }}
      >
        <Icon className={cn('h-4 w-4', isActive || isClicked ? 'text-white' : item.color)} aria-hidden="true" />
      </motion.div>
      <span className="group-hover:translate-x-1 transition-transform duration-200">{item.name}</span>
      {(isActive || isClicked) && !isPending && (
        <motion.div
          className="ml-auto w-2 h-2 bg-white rounded-full"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          aria-hidden="true"
        />
      )}
      {isPending && isClicked && (
        <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-50 flex items-center justify-center">
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

const sidebarVariants = {
  open: {
    x: 0,
    transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1, delayChildren: 0.2 }
  },
  closed: {
    x: "-100%",
    transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const itemVariants = {
  open: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
  closed: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const overlayVariants = {
  open: { opacity: 1, transition: { duration: 0.3 } },
  closed: { opacity: 0, transition: { duration: 0.3 } }
};

const FacultySidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();
  const router = useRouter();
  const { userProfile } = useAuth();

  useEffect(() => {
    const allRoutes = navigation.map(item => item.href);
    allRoutes.forEach(href => router.prefetch(href));
  }, [router]);

  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (!mobile) setIsOpen(true);
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  const handleNavigation = useCallback((href: string) => {
    if (currentPath === href) return;
    startTransition(() => {
      router.push(href);
      if (isMobile) setIsOpen(false);
    });
  }, [router, isMobile, currentPath]);

  const handleLogout = useCallback(async () => {
    startTransition(async () => {
      try {
        await signOut();
        router.push('/login/faculty');
      } catch (err) {
        // In a real app, you'd show a toast notification
      }
    });
  }, [router]);

  const isActive = useCallback((href: string) => currentPath === href, [currentPath]);
  const toggleMobile = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return (
    <>
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
          aria-controls="faculty-sidebar"
          aria-expanded={isOpen}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-green-200 hover:bg-green-50"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="h-5 w-5" aria-hidden="true"/> : <Menu className="h-5 w-5" aria-hidden="true"/>}
          </motion.div>
        </Button>
      </motion.div>

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

      <motion.div
        id="faculty-sidebar"
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gradient-to-b from-white via-green-50/30 to-white 
          dark:from-gray-900 dark:via-green-950/30 dark:to-gray-900 
          border-r border-green-100 dark:border-green-800 shadow-xl z-40
          flex flex-col overflow-hidden
        `}
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        style={{ width: "280px" }}
      >
        <motion.div 
          className="p-6 border-b border-green-100 dark:border-green-800 bg-gradient-to-r from-green-600 to-emerald-600"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <User className="h-5 w-5 text-green-600" aria-hidden="true"/>
            </motion.div>
            <div>
              <h2 className="font-bold text-lg text-white">Faculty Portal</h2>
              <p className="text-green-100 text-sm">Teaching Dashboard</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="p-4 border-b border-green-100 dark:border-green-800"
          variants={itemVariants}
        >
          <motion.button
            className="flex items-center gap-3 p-3 rounded-xl bg-green-50 dark:bg-green-900/50 hover:bg-green-100 dark:hover:bg-green-900 transition-colors cursor-pointer w-full text-left"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('/faculty/profile')}
            aria-label="View Profile"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold">
              {userProfile?.name?.charAt(0) || 'F'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userProfile?.name || 'Faculty'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userProfile?.facultyId || 'ID: Not Set'}
              </p>
            </div>
          </motion.button>
        </motion.div>

        <motion.nav 
          className="flex-1 p-4 overflow-y-auto" 
          variants={itemVariants} 
          role="navigation" 
          aria-label="Faculty Navigation"
        >
          <div className="space-y-2">
            {navigation.map((item, index) => (
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
            ))}
          </div>
        </motion.nav>

        <motion.div 
          className="p-4 border-t border-green-100 dark:border-green-800"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group disabled:opacity-50"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
            disabled={isPending}
          >
            <motion.div
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors"
              whileHover={{ rotate: -5 }}
            >
              <LogOut className="h-4 w-4" aria-hidden="true"/>
            </motion.div>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              {isPending ? 'Logging out...' : 'Logout'}
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default memo(FacultySidebar);