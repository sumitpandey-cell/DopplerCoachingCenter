'use client';

import React from 'react';
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
  Clock
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'User Management',
    icon: Users,
    children: [
      { name: 'Students', href: '/admin/students', icon: Users },
      { name: 'Faculty', href: '/admin/faculty', icon: UserCheck },
      { name: 'Student Enquiries', href: '/admin/enquiries', icon: FileText },
      { name: 'Faculty Enquiries', href: '/admin/faculty-enquiries', icon: UserCheck },
    ]
  },
  {
    name: 'Content Management',
    icon: BookOpen,
    children: [
      { name: 'Study Materials', href: '/admin/materials', icon: BookOpen },
      { name: 'Test Management', href: '/admin/tests', icon: FileText },
      { name: 'Announcements', href: '/admin/announcements', icon: Bell },
      { name: 'Subject Management', href: '/admin/subjects', icon: BookOpen },
    ]
  },
  {
    name: 'Schedule Control',
    icon: Calendar,
    children: [
      { name: 'Timetables', href: '/admin/timetables', icon: Calendar },
      { name: 'Class Scheduling', href: '/admin/scheduling', icon: Clock },
    ]
  },
  {
    name: 'Analytics & Reports',
    href: '/admin/analytics',
    icon: TrendingUp,
    description: 'Performance Insights'
  },
  {
    name: 'Financial Overview',
    href: '/admin/finance',
    icon: DollarSign,
    description: 'Revenue & Payments'
  },
  {
    name: 'Fees',
    icon: DollarSign,
    children: [
      { name: 'Overview', href: '/admin/fees', icon: DollarSign },
      { name: 'Fee Structures', href: '/admin/fees/structure', icon: FileText },
      { name: 'Payments', href: '/admin/fees/payments', icon: TrendingUp },
      { name: 'Reports', href: '/admin/fees/reports', icon: FileText },
    ]
  },
  {
    name: 'System Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Configuration'
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

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
    <div className="w-80 bg-white shadow-lg border-r min-h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-500">Doppler Coaching</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          if (item.children) {
            const isExpanded = expandedItems.includes(item.name);
            const hasActiveChild = isParentActive(item.children);
            
            return (
              <div key={item.name}>
                <button
                  onClick={() => toggleExpanded(item.name)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    hasActiveChild
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon
                      className={cn(
                        'mr-3 h-5 w-5',
                        hasActiveChild ? 'text-blue-500' : 'text-gray-400'
                      )}
                    />
                    {item.name}
                  </div>
                  <div className={cn(
                    'transition-transform',
                    isExpanded ? 'rotate-90' : ''
                  )}>
                    ▶
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.name}
                        href={child.href}
                        className={cn(
                          'flex items-center px-3 py-2 text-sm rounded-lg transition-colors',
                          isActive(child.href)
                            ? 'bg-blue-100 text-blue-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        )}
                      >
                        <child.icon
                          className={cn(
                            'mr-3 h-4 w-4',
                            isActive(child.href) ? 'text-blue-500' : 'text-gray-400'
                          )}
                        />
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive(item.href)
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5',
                  isActive(item.href) ? 'text-blue-500' : 'text-gray-400'
                )}
              />
              <div>
                <div>{item.name}</div>
                {item.description && (
                  <div className="text-xs text-gray-500">{item.description}</div>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default AdminSidebar;