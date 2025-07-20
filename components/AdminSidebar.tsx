'use client';

import React, { useState, useEffect, useTransition, memo, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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

// Optimized navigation item with immediate visual feedback
const NavigationItem = memo(({ 
  item, 
  isActive, 
  isMobile, 
  onNavigate,
  isPending 
}: { 
  item: any; 
  isActive: boolean; 
  isMobile: boolean; 
  onNavigate: (href: string) => void; 
  isPending: boolean;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const Icon = item.icon;
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsClicked(true);
    onNavigate(item.href);
    
    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 150);
  }, [item.href, onNavigate]);
  
  return (
    <Link
      href={item.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group relative overflow-hidden',
        isActive || isClicked
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 hover:scale-[1.01]',
        isPending && 'opacity-75 pointer-events-none'
      )}
    >
      {/* Loading indicator */}
      {isPending && isClicked && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-50" />
      )}
      
      <div
        className={cn(
          'p-2 rounded-lg shadow-sm transition-all duration-150 relative z-10',
          isActive || isClicked
            ? 'bg-white/20 scale-110' 
            : 'bg-white dark:bg-gray-800 group-hover:shadow-md group-hover:scale-105'
        )}
      >
        <Icon className={cn(
          'h-4 w-4 transition-transform duration-150',
          isActive || isClicked ? 'text-white' : item.color,
          isClicked && 'rotate-12'
        )} />
      </div>
      <div className="transition-all duration-150 group-hover:translate-x-1 relative z-10">
        <div className="font-medium">{item.name}</div>
        {item.description && (
          <div className="text-xs opacity-75">{item.description}</div>
        )}
      </div>
      {(isActive || isClicked) && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse relative z-10" />
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const ChildNavigationItem = memo(({ 
  child, 
  isActive, 
  isMobile, 
  onNavigate,
  isPending 
}: { 
  child: any; 
  isActive: boolean; 
  isMobile: boolean; 
  onNavigate: (href: string) => void; 
  isPending: boolean;
}) => {
  const [isClicked, setIsClicked] = useState(false);
  const Icon = child.icon;
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsClicked(true);
    onNavigate(child.href);
    
    // Reset clicked state after animation
    setTimeout(() => setIsClicked(false), 150);
  }, [child.href, onNavigate]);
  
  return (
    <Link
      href={child.href}
      onClick={handleClick}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-all duration-150 relative overflow-hidden',
        isActive || isClicked
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md transform scale-[1.02]'
          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 hover:scale-[1.01]',
        isPending && 'opacity-75 pointer-events-none'
      )}
    >
      {/* Loading indicator */}
      {isPending && isClicked && (
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 opacity-50" />
      )}
      
      <div
        className={cn(
          'p-1.5 rounded-md shadow-sm transition-all duration-150 relative z-10',
          isActive || isClicked
            ? 'bg-white/20 scale-110' 
            : 'bg-white dark:bg-gray-800 hover:scale-105'
        )}
      >
        <Icon className={cn(
          'h-3 w-3 transition-transform duration-150',
          isActive || isClicked ? 'text-white' : child.color,
          isClicked && 'rotate-12'
        )} />
      </div>
      <span className="relative z-10">{child.name}</span>
    </Link>
  );
});

ChildNavigationItem.displayName = 'ChildNavigationItem';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const [currentPath, setCurrentPath] = useState('');
  const pathname = usePathname();
  const router = useRouter();

  // Immediate pathname update for instant visual feedback
  useEffect(() => {
    setCurrentPath(pathname);
  }, [pathname]);

  // Memoize mobile check to prevent unnecessary re-renders
  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1280;
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

  // Aggressive route prefetching with priority
  useEffect(() => {
    const prefetchRoutes = async () => {
      const routes = [
        '/admin/dashboard',
        '/admin/students', 
        '/admin/faculty',
        '/admin/enquiries',
        '/admin/faculty-enquiries',
        '/admin/materials',
        '/admin/tests',
        '/admin/announcements',
        '/admin/subjects',
        '/admin/timetables',
        '/admin/scheduling',
        '/admin/fees',
        '/admin/settings'
      ];
      
      // Prefetch high-priority routes immediately
      const highPriorityRoutes = ['/admin/dashboard', '/admin/students', '/admin/fees'];
      for (const route of highPriorityRoutes) {
        router.prefetch(route);
      }
      
      // Prefetch remaining routes with slight delay
      setTimeout(() => {
        routes.forEach(route => {
          if (!highPriorityRoutes.includes(route)) {
            router.prefetch(route);
          }
        });
      }, 100);
    };
    
    prefetchRoutes();
  }, [router]);

  // Memoize expanded items calculation
  const expandedItemsCalculation = useMemo(() => {
    return navigation
      .filter(item => item.children && item.children.some(child => currentPath === child.href))
      .map(item => item.name);
  }, [currentPath]);

  useEffect(() => {
    setExpandedItems(expandedItemsCalculation);
  }, [expandedItemsCalculation]);

  // Optimized navigation handler with immediate feedback
  const handleNavigation = useCallback((href: string) => {
    // Immediate visual feedback
    setCurrentPath(href);
    
    startTransition(() => {
      router.push(href);
      if (isMobile) {
        setIsOpen(false);
      }
    });
  }, [router, isMobile]);

  // Optimized logout handler
  const handleLogout = useCallback(() => {
    startTransition(() => {
      adminLogout();
      router.push('/');
    });
  }, [router]);

  // Memoized toggle function
  const toggleExpanded = useCallback((itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(item => item !== itemName)
        : [...prev, itemName]
    );
  }, []);

  // Memoized active state checkers
  const isActive = useCallback((href: string) => currentPath === href, [currentPath]);
  const isParentActive = useCallback((children: any[]) => 
    children.some(child => currentPath === child.href), [currentPath]);

  // Memoized mobile toggle
  const toggleMobile = useCallback(() => setIsOpen(!isOpen), [isOpen]);

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="xl:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleMobile}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-indigo-200 hover:bg-indigo-50 transition-all duration-200"
        >
          <div className={cn(
            'transition-transform duration-300',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          `${isMobile ? 'fixed' : 'relative'} 
          top-0 left-0 h-screen bg-gradient-to-b from-white via-indigo-50/30 to-white 
          dark:from-gray-900 dark:via-indigo-950/30 dark:to-gray-900 
          border-r border-indigo-100 dark:border-indigo-800 shadow-xl z-40
          flex flex-col overflow-hidden transition-all duration-300 ease-out`,
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
        )}
        style={{ width: "320px" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg transform transition-transform hover:scale-105">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">Admin Panel</h2>
              <p className="text-indigo-100 text-sm">Doppler Coaching</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-indigo-200 scrollbar-track-transparent">
          <div className="space-y-2">
            {navigation.map((item) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.name);
                const hasActiveChild = isParentActive(item.children);
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-150 group relative overflow-hidden',
                        hasActiveChild
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg transform scale-[1.02]'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300 hover:scale-[1.01]'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg shadow-sm transition-all duration-150',
                            hasActiveChild 
                              ? 'bg-white/20 scale-110' 
                              : 'bg-white dark:bg-gray-800 group-hover:shadow-md group-hover:scale-105'
                          )}
                        >
                          <item.icon className={cn(
                            'h-4 w-4 transition-transform duration-150',
                            hasActiveChild ? 'text-white' : item.color
                          )} />
                        </div>
                        <span className="transition-transform duration-150 group-hover:translate-x-1">
                          {item.name}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'transition-transform duration-300 ease-out',
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                    
                    <div className={cn(
                      'overflow-hidden transition-all duration-300 ease-out',
                      isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    )}>
                      <div className="ml-6 mt-2 space-y-1">
                        {item.children.map((child) => (
                          <ChildNavigationItem
                            key={child.name}
                            child={child}
                            isActive={isActive(child.href)}
                            isMobile={isMobile}
                            onNavigate={handleNavigation}
                            isPending={isPending}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <NavigationItem
                  key={item.name}
                  item={item}
                  isActive={isActive(item.href!)}
                  isMobile={isMobile}
                  onNavigate={handleNavigation}
                  isPending={isPending}
                />
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-indigo-100 dark:border-indigo-800">
          <button
            onClick={handleLogout}
            disabled={isPending}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 group disabled:opacity-50 hover:scale-[1.01] active:scale-[0.99]"
          >
            <div
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-all duration-150 group-hover:scale-105"
            >
              <LogOut className="h-4 w-4" />
            </div>
            <span className="transition-transform duration-150 group-hover:translate-x-1">
              {isPending ? 'Logging out...' : 'Logout'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default memo(AdminSidebar);