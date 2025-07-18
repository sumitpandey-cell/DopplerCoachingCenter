'use client';
import { useState } from "react";
import { User, LogOut, Edit, Key } from "lucide-react";
import { useRouter } from 'next/navigation';
import { signOut } from '@/firebase/auth';
import Link from 'next/link';
import { useEffect, useRef } from 'react';

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
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-4 py-2 rounded-full shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {user.photoUrl ? (
          <img src={user.photoUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
        ) : (
          <span className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
            {getInitials(user.name)}
          </span>
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-100">{user.name}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 min-w-[14rem] max-w-[90vw] bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 p-0 overflow-auto">
          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{user.email}</div>
          </div>
          <Link href="/student/profile" className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition" onClick={() => setOpen(false)}>
            <User className="h-4 w-4 mr-2" /> My Profile
          </Link>
          <Link href="/student/profile/edit" className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition" onClick={() => setOpen(false)}>
            <Edit className="h-4 w-4 mr-2" /> Edit Info
          </Link>
          <Link href="/student/profile/password" className="flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition" onClick={() => setOpen(false)}>
            <Key className="h-4 w-4 mr-2" /> Change Password
          </Link>
          <div className="border-t border-gray-100 dark:border-gray-800 my-1" />
          <button onClick={handleLogout} className="flex items-center px-4 py-2 w-full text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-900 transition">
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </button>
        </div>
      )}
    </div>
  );
} 