'use client';

import React, { memo } from 'react';
import { Award, TrendingUp, BookOpen, Bell } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface CardData {
  label: string;
  value: number | string;
  icon: React.ElementType;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

interface OptimizedDashboardCardsProps {
  cards: CardData[];
}

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

// Memoized card component to prevent unnecessary re-renders
const DashboardCard = memo<{
  card: CardData;
  index: number;
}>(({ card, index }) => {
  const { label, value, icon: Icon, href, color, bgColor, borderColor } = card;

  return (
    <motion.div
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
  );
});

DashboardCard.displayName = 'DashboardCard';

const OptimizedDashboardCards = memo<OptimizedDashboardCardsProps>(({ cards }) => {
  return (
    <motion.div 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {cards.map((card, index) => (
        <DashboardCard
          key={card.label}
          card={card}
          index={index}
        />
      ))}
    </motion.div>
  );
});

OptimizedDashboardCards.displayName = 'OptimizedDashboardCards';

export default OptimizedDashboardCards;