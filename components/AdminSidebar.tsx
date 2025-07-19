'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { adminLogout } from '@/firebase/admin-auth';
import { 
  LayoutDashboard,
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  DollarSign,
  Bell,
  Settings,
  LogOut,
  Shield,
  FileText,
  UserCheck,
  Clock,
  BarChart3,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    color: 'text-blue-500'
  },
  {
    name: 'User Management',
    icon: Users,
    color: 'text-green-500',
    children: [
      { name: 'Students', href: '/admin/students', icon: Users, color: 'text-blue-500' },
      { name: 'Faculty', href: '/admin/faculty', icon: UserCheck, color: 'text-green-500' },
      { name: 'Student Enquiries', href: '/admin/enquiries', icon: FileText, color: 'text-purple-500' },
      { name: 'Faculty Enquiries', href: '/admin/faculty-enquiries', icon: UserCheck, color: 'text-orange-500' },
    ]
  },
  {
    name: 'Content Management',
    icon: BookOpen,
    color: 'text-purple-500',
    children: [
      { name: 'Study Materials', href: '/admin/materials', icon: BookOpen, color: 'text-blue-500' },
      { name: 'Test Management', href: '/admin/tests', icon: FileText, color: 'text-green-500' },
      { name: 'Announcements', href: '/admin/announcements', icon: Bell, color: 'text-yellow-500' },
      { name: 'Subject Management', href: '/admin/subjects', icon: BookOpen, color: 'text-purple-500' },
    ]
  },
  {
    name: 'Schedule Control',
    icon: Calendar,
    color: 'text-orange-500',
    children: [
      { name: 'Timetables', href: '/admin/timetables', icon: Calendar, color: 'text-blue-500' },
      { name: 'Class Scheduling', href: '/admin/scheduling', icon: Clock, color: 'text-green-500' },
    ]
  },
  {
    name: 'Finance Analysis',
    icon: DollarSign,
    href: "/admin/fees",
    color: 'text-emerald-500'
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration',
    color: 'text-gray-500'
  },
];

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  },
  closed: {
    x: "-100%",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
      staggerChildren: 0.05,
      staggerDirection: -1,
    }
  }
};

const itemVariants = {
  open: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
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

const overlayVariants = {
  open: {
    opacity: 1,
    transition: { duration: 0.3 }
  },
  closed: {
    opacity: 0,
    transition: { duration: 0.3 }
  }
};

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1280);
      if (window.innerWidth >= 1280) {
        setIsOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    // Expand any parent whose child is active
    const expanded = navigation
      .filter(item => item.children && item.children.some(child => pathname === child.href))
      .map(item => item.name);
    setExpandedItems(expanded);
  }, [pathname]);

  const handleLogout = () => {
    adminLogout();
    router.push('/');
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (href: string) => pathname === href;
  const isParentActive = (children: any[]) => 
    children.some(child => pathname === child.href);

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div 
        className="xl:hidden fixed top-4 left-4 z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-indigo-200 hover:bg-indigo-50"
        >
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-40 xl:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white 
          dark:from-gray-900 dark:via-indigo-950/30 dark:to-gray-900 
          border-r border-indigo-100 dark:border-indigo-800 shadow-xl z-40
          flex flex-col overflow-hidden
        `}
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        style={{ width: "320px" }}
      >
        {/* Header */}
        <motion.div 
          className="p-6 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-600 to-purple-600"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Shield className="h-6 w-6 text-indigo-600" />
            </motion.div>
            <div>
              <h2 className="font-bold text-xl text-white">Admin Panel</h2>
              <p className="text-indigo-100 text-sm">Doppler Coaching</p>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.nav className="flex-1 p-4 overflow-y-auto" variants={itemVariants}>
          <div className="space-y-2">
            {navigation.map((item, index) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.name);
                const hasActiveChild = isParentActive(item.children);
                
                return (
                  <motion.div key={item.name} variants={itemVariants} custom={index}>
                    <motion.button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                        hasActiveChild
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
                      )}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center gap-3">
                        <motion.div
                          className={cn(
                            'p-2 rounded-lg shadow-sm transition-all',
                            hasActiveChild 
                              ? 'bg-white/20' 
                              : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
                          )}
                          whileHover={{ rotate: 5 }}
                        >
                          <item.icon className={cn(
                            'h-4 w-4',
                            hasActiveChild ? 'text-white' : item.color
                          )} />
                        </motion.div>
                        <span className="group-hover:translate-x-1 transition-transform duration-200">
                          {item.name}
                        </span>
                      </div>
                      <motion.div
                        animate={{ rotate: isExpanded ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </motion.button>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-6 mt-2 space-y-1 overflow-hidden"
                        >
                          {item.children.map((child, childIndex) => (
                            <motion.div
                              key={child.name}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: childIndex * 0.1 }}
                            >
                              <Link
                                href={child.href}
                                onClick={() => isMobile && setIsOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-200',
                                  isActive(child.href)
                                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
                                )}
                              >
                                <motion.div
                                  className={cn(
                                    'p-1.5 rounded-md shadow-sm',
                                    isActive(child.href) 
                                      ? 'bg-white/20' 
                                      : 'bg-white dark:bg-gray-800'
                                  )}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  <child.icon className={cn(
                                    'h-3 w-3',
                                    isActive(child.href) ? 'text-white' : child.color
                                  )} />
                                </motion.div>
                                <span>{child.name}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              }

              const active = isActive(item.href!);
              return (
                <motion.div
                  key={item.name}
                  variants={itemVariants}
                  custom={index}
                >
                  <Link
                    href={item.href!}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group',
                      active
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
                    )}
                  >
                    <motion.div
                      className={cn(
                        'p-2 rounded-lg shadow-sm transition-all',
                        active 
                          ? 'bg-white/20' 
                          : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
                      )}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <item.icon className={cn(
                        'h-4 w-4',
                        active ? 'text-white' : item.color
                      )} />
                    </motion.div>
                    <div className="group-hover:translate-x-1 transition-transform duration-200">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-xs opacity-75">{item.description}</div>
                      )}
                    </div>
                    {active && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.nav>

        {/* Footer */}
        <motion.div 
          className="p-4 border-t border-indigo-100 dark:border-indigo-800"
          variants={itemVariants}
        >
          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
            whileHover={{ scale: 1.02, x: 4 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors"
              whileHover={{ rotate: -5 }}
            >
              <LogOut className="h-4 w-4" />
            </motion.div>
            <span className="group-hover:translate-x-1 transition-transform duration-200">
              Logout
            </span>
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default AdminSidebar;