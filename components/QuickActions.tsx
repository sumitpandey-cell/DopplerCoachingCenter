'use client';
import { BookOpen, Calendar, TrendingUp, Bell } from "lucide-react";
import Link from "next/link";

const actions = [
  {
    label: "Study Materials",
    icon: BookOpen,
    href: "/student/materials",
    color: "bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300",
    hover: "hover:bg-blue-100 dark:hover:bg-blue-800",
  },
  {
    label: "Timetable",
    icon: Calendar,
    href: "/student/timetable",
    color: "bg-green-50 dark:bg-green-900 text-green-600 dark:text-green-300",
    hover: "hover:bg-green-100 dark:hover:bg-green-800",
  },
  {
    label: "Performance",
    icon: TrendingUp,
    href: "/student/performance",
    color: "bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300",
    hover: "hover:bg-purple-100 dark:hover:bg-purple-800",
  },
  {
    label: "Announcements",
    icon: Bell,
    href: "/student/announcements",
    color: "bg-orange-50 dark:bg-orange-900 text-orange-600 dark:text-orange-300",
    hover: "hover:bg-orange-100 dark:hover:bg-orange-800",
  },
];

export default function QuickActions() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
      {actions.map(({ label, icon: Icon, href, color, hover }) => (
        <Link
          key={label}
          href={href}
          className={`flex flex-col items-center p-4 rounded-lg transition ${color} ${hover} shadow group`}
        >
          <Icon className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
          <span className="font-medium">{label}</span>
        </Link>
      ))}
    </div>
  );
} 