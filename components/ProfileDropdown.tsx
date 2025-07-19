'use client';
import { useState } from "react";
import { User, LogOut, Edit, Key } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signOut } from '@/firebase/auth';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

function getInitials(name: string): string {
  return name
    ? name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';
}

interface ProfileDropdownProps {
  user: { name: string; email: string; photoUrl?: string };
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login/student');
    } catch (err) {
      alert('Logout failed. Please try again.');
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow-lg bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-blue-200 dark:border-blue-700 hover:shadow-xl transition-all duration-300"
        aria-haspopup="true"
        aria-expanded={open}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {user.photoUrl ? (
          <motion.img 
            src={user.photoUrl} 
            alt="avatar" 
            className="h-8 w-8 rounded-full object-cover border-2 border-blue-200"
            whileHover={{ scale: 1.1 }}
          />
        ) : (
          <motion.span 
            className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center font-bold shadow-md"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            {getInitials(user.name)}
          </motion.span>
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-100 group-hover:text-blue-600 transition-colors">
          {user.name}
        </span>
      </motion.button>
      
      <AnimatePresence>
        {open && (
          <motion.div 
            className="absolute right-0 mt-2 w-56 min-w-[14rem] max-w-[90vw] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-800 z-50 p-0 overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
          >
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <motion.div 
              className="font-medium text-gray-900 dark:text-gray-100"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {user.name}
            </motion.div>
            <motion.div 
              className="text-xs text-gray-500 dark:text-gray-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              {user.email}
            </motion.div>
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div whileHover={{ x: 4, backgroundColor: "rgba(59, 130, 246, 0.1)" }}>
              <Link href="/student/profile" className="flex items-center px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all duration-200" onClick={() => setOpen(false)}>
                <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                  <User className="h-4 w-4 mr-3 text-blue-500" />
                </motion.div>
                My Profile
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ x: 4, backgroundColor: "rgba(34, 197, 94, 0.1)" }}>
              <Link href="/student/profile/edit" className="flex items-center px-4 py-3 hover:bg-green-50 dark:hover:bg-green-900/50 transition-all duration-200" onClick={() => setOpen(false)}>
                <motion.div whileHover={{ scale: 1.2 }} transition={{ duration: 0.3 }}>
                  <Edit className="h-4 w-4 mr-3 text-green-500" />
                </motion.div>
                Edit Info
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ x: 4, backgroundColor: "rgba(168, 85, 247, 0.1)" }}>
              <Link href="/student/profile/password" className="flex items-center px-4 py-3 hover:bg-purple-50 dark:hover:bg-purple-900/50 transition-all duration-200" onClick={() => setOpen(false)}>
                <motion.div whileHover={{ rotate: -15 }} transition={{ duration: 0.3 }}>
                  <Key className="h-4 w-4 mr-3 text-purple-500" />
                </motion.div>
                Change Password
              </Link>
            </motion.div>
          </motion.div>
          
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          
          <motion.div
            whileHover={{ x: 4, backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            whileTap={{ scale: 0.98 }}
          >
            <button onClick={handleLogout} className="flex items-center px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 transition-all duration-200">
              <motion.div whileHover={{ rotate: -15 }} transition={{ duration: 0.3 }}>
                <LogOut className="h-4 w-4 mr-3" />
              </motion.div>
              Logout
            </button>
          </motion.div>
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 