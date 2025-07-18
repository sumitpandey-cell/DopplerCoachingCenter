'use client';

import { useState } from "react";
import Link from "next/link";
import { LayoutDashboard, BookOpen, Calendar, Bell, TrendingUp, FileText, DollarSign, ChevronDown } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Study Materials", href: "/student/materials", icon: BookOpen },
  { name: "Timetable", href: "/student/timetable", icon: Calendar },
  { name: "Performance", href: "/student/performance", icon: TrendingUp },
  { name: "Test Results", href: "/student/tests", icon: FileText },
  { name: "Announcements", href: "/student/announcements", icon: Bell },
  {
    name: "Payments",
    icon: DollarSign,
    children: [
      { name: "Overview", href: "/student/fees", icon: DollarSign },
      { name: "Payment History", href: "/student/fees/payments", icon: FileText },
    ],
  },
  { name: "Subject Enrollment", href: "/student/subjects", icon: BookOpen },
];

export default function StudentSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState({});

  const toggleGroup = (name) => setOpenGroups((g) => ({ ...g, [name]: !g[name] }));

  return (
    <aside className={`bg-white dark:bg-gray-900 border-r shadow-sm transition-all duration-300 ${collapsed ? "w-16" : "w-64"} min-h-screen flex flex-col`}>
      <div className="flex items-center justify-between p-4">
        <span className={`font-bold text-lg text-blue-700 dark:text-blue-300 transition-all ${collapsed ? "hidden" : ""}`}>Student Portal</span>
        <button onClick={() => setCollapsed((c) => !c)} className="md:hidden p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronDown className={`h-5 w-5 transform transition-transform ${collapsed ? "-rotate-90" : ""}`} />
        </button>
      </div>
      <nav className="flex-1 px-2">
        {navigation.map((item) =>
          item.children ? (
            <div key={item.name} className="mb-2">
              <button
                onClick={() => toggleGroup(item.name)}
                className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {!collapsed && item.name}
                <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${openGroups[item.name] ? "rotate-180" : ""}`} />
              </button>
              {openGroups[item.name] && (
                <div className="ml-8">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      href={child.href}
                      className="flex items-center px-3 py-2 text-sm rounded-md mb-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <child.icon className="mr-3 h-4 w-4" />
                      {!collapsed && child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <item.icon className="mr-3 h-5 w-5" />
              {!collapsed && item.name}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}