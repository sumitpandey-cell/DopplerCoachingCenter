'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Users, 
  Upload, 
  Calendar, 
  Bell, 
  ClipboardList
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/faculty/dashboard', icon: LayoutDashboard },
  { name: 'Students', href: '/faculty/students', icon: Users },
  { name: 'Upload Materials', href: '/faculty/upload-materials', icon: Upload },
  { name: 'Schedule Tests', href: '/faculty/schedule-tests', icon: Calendar },
  { name: 'Enter Scores', href: '/faculty/enter-scores', icon: ClipboardList },
  { name: 'Announcements', href: '/faculty/post-announcements', icon: Bell },
];

const FacultySidebar = () => {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-sm border-r min-h-screen">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900">Faculty Portal</h2>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
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

export default FacultySidebar;