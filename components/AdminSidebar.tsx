'use client';

import React, { useState, useEffect, useTransition, memo } from 'react';
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

// Memoized navigation item components to prevent unnecessary re-renders
const NavigationItem = memo(({ 
  item, 
  isActive, 
  isMobile, 
  onNavigate 
}: { 
  item: any; 
  isActive: boolean; 
  isMobile: boolean; 
  onNavigate: (href: string) => void; 
}) => {
  const Icon = item.icon;
  
  return (
    <Link
      href={item.href}
      onClick={(e) => {
        if (isMobile) {
          e.preventDefault();
          onNavigate(item.href);
        }
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150 group',
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg shadow-sm transition-colors duration-150',
          isActive 
            ? 'bg-white/20' 
            : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
        )}
      >
        <Icon className={cn(
          'h-4 w-4',
          isActive ? 'text-white' : item.color
        )} />
      </div>
      <div className="transition-transform duration-150 group-hover:translate-x-1">
        <div className="font-medium">{item.name}</div>
        {item.description && (
          <div className="text-xs opacity-75">{item.description}</div>
        )}
      </div>
      {isActive && (
        <div className="ml-auto w-2 h-2 bg-white rounded-full" />
      )}
    </Link>
  );
});

NavigationItem.displayName = 'NavigationItem';

const ChildNavigationItem = memo(({ 
  child, 
  isActive, 
  isMobile, 
  onNavigate 
}: { 
  child: any; 
  isActive: boolean; 
  isMobile: boolean; 
  onNavigate: (href: string) => void; 
}) => {
  const Icon = child.icon;
  
  return (
    <Link
      href={child.href}
      onClick={(e) => {
        if (isMobile) {
          e.preventDefault();
          onNavigate(child.href);
        }
      }}
      className={cn(
        'flex items-center gap-3 px-4 py-2 text-sm rounded-lg transition-colors duration-150',
        isActive
          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md'
          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
      )}
    >
      <div
        className={cn(
          'p-1.5 rounded-md shadow-sm transition-colors duration-150',
          isActive 
            ? 'bg-white/20' 
            : 'bg-white dark:bg-gray-800'
        )}
      >
        <Icon className={cn(
          'h-3 w-3',
          isActive ? 'text-white' : child.color
        )} />
      </div>
      <span>{child.name}</span>
    </Link>
  );
});

ChildNavigationItem.displayName = 'ChildNavigationItem';

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
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

  // Preload router to avoid first-click delay
  useEffect(() => {
    // Preload main navigation routes
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
    
    routes.forEach(route => {
      router.prefetch(route);
    });
  }, [router]);

  React.useEffect(() => {
    // Expand any parent whose child is active
    const expanded = navigation
      .filter(item => item.children && item.children.some(child => pathname === child.href))
      .map(item => item.name);
    setExpandedItems(expanded);
  }, [pathname]);

  const handleLogout = () => {
    adminLogout();
    startTransition(() => {
      router.push('/');
    });
  };

  const handleNavigation = (href: string) => {
    startTransition(() => {
      router.push(href);
      if (isMobile) {
        setIsOpen(false);
      }
    });
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
      <div className="xl:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white/90 backdrop-blur-sm shadow-lg border-indigo-200 hover:bg-indigo-50"
        >
          <div className={cn(
            'transition-transform duration-200',
            isOpen ? 'rotate-180' : 'rotate-0'
          )}>
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </div>
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 xl:hidden transition-opacity duration-200"
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
          flex flex-col overflow-hidden transition-transform duration-300`,
          isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'
        )}
        style={{ width: "320px" }}
      >
        {/* Header */}
        <div className="p-6 border-b border-indigo-100 dark:border-indigo-800 bg-gradient-to-r from-indigo-600 to-purple-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Shield className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-xl text-white">Admin Panel</h2>
              <p className="text-indigo-100 text-sm">Doppler Coaching</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigation.map((item, index) => {
              if (item.children) {
                const isExpanded = expandedItems.includes(item.name);
                const hasActiveChild = isParentActive(item.children);
                
                return (
                  <div key={item.name}>
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150 group',
                        hasActiveChild
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/50 hover:text-indigo-700 dark:hover:text-indigo-300'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'p-2 rounded-lg shadow-sm transition-colors duration-150',
                            hasActiveChild 
                              ? 'bg-white/20' 
                              : 'bg-white dark:bg-gray-800 group-hover:shadow-md'
                          )}
                        >
                          <item.icon className={cn(
                            'h-4 w-4',
                            hasActiveChild ? 'text-white' : item.color
                          )} />
                        </div>
                        <span className="transition-transform duration-150 group-hover:translate-x-1">
                          {item.name}
                        </span>
                      </div>
                      <div
                        className={cn(
                          'transition-transform duration-300',
                          isExpanded ? 'rotate-180' : 'rotate-0'
                        )}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className="ml-6 mt-2 space-y-1 overflow-hidden">
                        {item.children.map((child, childIndex) => (
                          <ChildNavigationItem
                            key={child.name}
                            child={child}
                            isActive={isActive(child.href)}
                            isMobile={isMobile}
                            onNavigate={handleNavigation}
                          />
                        ))}
                      </div>
                    )}
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
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 group disabled:opacity-50"
          >
            <div
              className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 group-hover:bg-red-100 dark:group-hover:bg-red-900/40 transition-colors duration-150"
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

export default AdminSidebar;