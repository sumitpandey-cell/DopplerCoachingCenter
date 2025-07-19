import { Award, TrendingUp, BookOpen, Bell } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const cards = [
  {
    label: "Total Tests",
    value: 12,
    icon: Award,
    href: "/student/tests",
    color: "text-yellow-500",
  },
  {
    label: "Average Score",
    value: "87%",
    icon: TrendingUp,
    href: "/student/performance",
    color: "text-green-500",
  },
  {
    label: "Study Materials",
    value: 24,
    icon: BookOpen,
    href: "/student/materials",
    color: "text-blue-500",
  },
  {
    label: "Announcements",
    value: 3,
    icon: Bell,
    href: "/student/announcements",
    color: "text-orange-500",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map(({ label, value, icon: Icon, href, color }) => (
        <Link key={label} href={href} className="group">
          <motion.div
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-md group-hover:shadow-xl transition-shadow border border-gray-100 dark:border-gray-800 p-6 flex flex-col items-center cursor-pointer"
          >
            <Icon className={`h-8 w-8 mb-2 ${color}`} />
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{label}</div>
            <div className="text-3xl font-bold mt-1 text-blue-700 dark:text-blue-300">{value}</div>
          </motion.div>
        </Link>
      ))}
    </div>
  );
} 