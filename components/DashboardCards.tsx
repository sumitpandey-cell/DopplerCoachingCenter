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
    bgColor: "from-yellow-50 to-orange-50",
    borderColor: "border-yellow-200",
  },
  {
    label: "Average Score",
    value: "87%",
    icon: TrendingUp,
    href: "/student/performance",
    color: "text-green-500",
    bgColor: "from-green-50 to-emerald-50",
    borderColor: "border-green-200",
  },
  {
    label: "Study Materials",
    value: 24,
    icon: BookOpen,
    href: "/student/materials",
    color: "text-blue-500",
    bgColor: "from-blue-50 to-indigo-50",
    borderColor: "border-blue-200",
  },
  {
    label: "Announcements",
    value: 3,
    icon: Bell,
    href: "/student/announcements",
    color: "text-orange-500",
    bgColor: "from-orange-50 to-red-50",
    borderColor: "border-orange-200",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.9
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 24
    }
  }
};

export default function DashboardCards() {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map(({ label, value, icon: Icon, href, color, bgColor, borderColor }, index) => (
        <motion.div
          key={label}
          variants={cardVariants}
          whileHover={{ 
            scale: 1.05,
            y: -5,
            transition: { type: "spring", stiffness: 400, damping: 10 }
          }}
          whileTap={{ scale: 0.95 }}
        >
          <Link href={href} className="group block">
            <div className={`
              bg-gradient-to-br ${bgColor} 
              dark:from-gray-800 dark:to-gray-900 
              rounded-2xl shadow-lg group-hover:shadow-xl 
              transition-all duration-300 border ${borderColor} 
              dark:border-gray-700 p-6 h-full relative overflow-hidden
            `}>
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-current"></div>
                <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-current"></div>
              </div>
              
              {/* Content */}
              <div className="relative z-10 flex flex-col items-center text-center">
                <motion.div
                  className={`p-3 rounded-2xl bg-white dark:bg-gray-800 shadow-lg mb-4 ${color}`}
                  whileHover={{ 
                    rotate: [0, -10, 10, -10, 0],
                    scale: 1.1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <Icon className="h-8 w-8" />
                </motion.div>
                
                <motion.div 
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  {label}
                </motion.div>
                
                <motion.div 
                  className="text-3xl font-bold text-gray-900 dark:text-gray-100"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 500, 
                    damping: 25,
                    delay: 0.4 + index * 0.1 
                  }}
                >
                  {value}
                </motion.div>

                {/* Hover Effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.6 }}
                />
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
  );
}