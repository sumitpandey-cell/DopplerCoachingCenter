'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutDashboard, BookOpen, Calendar, Bell, TrendingUp, FileText, DollarSign, ChevronDown, Menu, X, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOut } from "@/firebase/auth";
import { useRouter } from "next/navigation";

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

export default function StudentSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { userProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setIsOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleGroup = (name: string) => {
    setOpenGroups((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login/student');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const isActive = (href: string) => pathname === href;

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
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-blue-200 hover:bg-blue-50"
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
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            variants={overlayVariants}
            initial="closed"
            animate="open"
            exit="closed"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`
          ${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gradient-to-b from-white via-blue-50/30 to-white 
          dark:from-gray-900 dark:via-blue-950/30 dark:to-gray-900 
          border-r border-blue-100 dark:border-blue-800 shadow-xl z-40
          flex flex-col overflow-hidden
        `}
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        style={{ width: "280px" }}
      >
        {/* Header */}
        <motion.div 
          className="p-6 border-b border-blue-100 dark:border-blue-800 bg-gradient-to-r from-blue-600 to-indigo-600"
          variants={itemVariants}
        >
          <div className="flex items-center gap-3">
            <motion.div
              className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <LayoutDashboard className="h-5 w-5 text-blue-600" />
            </motion.div>
            <div>
              <h2 className="font-bold text-lg text-white">Student Portal</h2>
              <p className="text-blue-100 text-sm">Welcome back!</p>
            </div>
          </div>
        </motion.div>

        {/* User Profile Section */}
        <motion.div 
          className="p-4 border-b border-blue-100 dark:border-blue-800"
          variants={itemVariants}
        >
          <motion.div 
            className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/50 hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
              {userProfile?.name?.charAt(0) || 'S'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                {userProfile?.name || 'Student'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {userProfile?.studentId || 'ID: Not Set'}
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Navigation */}
        <motion.nav className="flex-1 p-4 overflow-y-auto" variants={itemVariants}>
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
                    className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-xl text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200 group"
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center gap-3">
                      <motion.div
                        className={`p-2 rounded-lg bg-white dark:bg-gray-800 shadow-sm group-hover:shadow-md transition-shadow ${item.color}`}
                        whileHover={{ rotate: 5 }}
                      >
                        <item.icon className="h-4 w-4" />
                      </motion.div>
                      <span className="group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: openGroups[item.name] ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openGroups[item.name] && (
                      <motion.div
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
                            <Link
                              href={child.href}
                              onClick={() => isMobile && setIsOpen(false)}
                              className={`
                                flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-200
                                ${isActive(child.href)
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg'
                                  : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300'
                                }
                              `}
                            >
                              <motion.div
                                className={`p-1.5 rounded-md ${isActive(child.href) ? 'bg-white/20' : 'bg-white dark:bg-gray-800'} shadow-sm`}
                                whileHover={{ scale: 1.1 }}
                              >
                                <child.icon className={`h-3 w-3 ${isActive(child.href) ? 'text-white' : child.color}`} />
                              </motion.div>
                              <span>{child.name}</span>
                            </Link>
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
                  <Link
                    href={item.href}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group
                      ${isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-700 dark:hover:text-blue-300'
                      }
                    `}
                  >
                    <motion.div
                      className={`p-2 rounded-lg shadow-sm transition-all ${
                        isActive(item.href) 
                          ? 'bg-white/20' 
                          : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
                      }`}
                      whileHover={{ rotate: 5, scale: 1.1 }}
                    >
                      <item.icon className={`h-4 w-4 ${isActive(item.href) ? 'text-white' : item.color}`} />
                    </motion.div>
                    <span className="group-hover:translate-x-1 transition-transform duration-200">
                      {item.name}
                    </span>
                    {isActive(item.href) && (
                      <motion.div
                        className="ml-auto w-2 h-2 bg-white rounded-full"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              )
            )}
          </div>
        </motion.nav>

        {/* Footer */}
        <motion.div 
          className="p-4 border-t border-blue-100 dark:border-blue-800"
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
      </motion.aside>
    </>
  );
}