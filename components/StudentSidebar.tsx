'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  BookOpen, 
  Calendar, 
  Bell, 
  TrendingUp,
  FileText,
  DollarSign
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Study Materials', href: '/student/materials', icon: BookOpen },
  { name: 'Timetable', href: '/student/timetable', icon: Calendar },
  { name: 'Performance', href: '/student/performance', icon: TrendingUp },
  { name: 'Test Results', href: '/student/tests', icon: FileText },
  { name: 'Announcements', href: '/student/announcements', icon: Bell },
  {
    name: 'Fees',
    icon: DollarSign,
    children: [
      { name: 'Overview', href: '/student/fees', icon: DollarSign },
      { name: 'Payment History', href: '/student/fees/payments', icon: FileText },
    ]
  },
  { name: 'Subject Enrollment', href: '/student/subjects', icon: BookOpen },
];

const StudentSidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Student Portal</h2>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            if (item.children) {
              return (
                <div key={item.name} className="mb-2">
                  <div className="flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-600">
                    <item.icon className="mr-3 h-5 w-5 text-gray-400" />
                    {item.name}
                  </div>
                  <div className="ml-8">
                    {item.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.name}
                          href={child.href}
                          className={cn(
                            'group flex items-center px-3 py-2 text-sm rounded-md mb-1',
                            isActive
                              ? 'bg-blue-100 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          )}
                        >
                          <child.icon className="mr-3 h-4 w-4 text-gray-400 group-hover:text-gray-500" />
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <item.icon
                  className={cn(
                    'mr-3 h-5 w-5',
                    isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                  )}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default StudentSidebar;