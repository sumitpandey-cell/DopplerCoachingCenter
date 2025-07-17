'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { GraduationCap, LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AdminLoginButton from '@/components/AdminLoginButton';
import { useState } from 'react';

const Navbar = () => {
  const { user, userProfile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-gradient-to-br from-blue-50/80 via-white/80 to-indigo-100/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">Doppler Coaching</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="relative text-base font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 group">
              Home
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="relative text-base font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 group">
              Courses
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="relative text-base font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 group">
              About
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="#" className="relative text-base font-medium text-gray-700 transition-colors duration-200 hover:text-blue-600 group">
              Contact
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Desktop Buttons */}
          <div className="hidden md:flex items-center space-x-2">
            {user && userProfile ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>{userProfile.name}</span>
                    {userProfile.studentId && (
                      <span className="text-xs text-gray-500">({userProfile.studentId})</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/${userProfile.role}/dashboard`}>
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full px-6 py-2 shadow-md hover:from-blue-600 hover:to-indigo-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none"
                >
                  <Link href="/join">Join Now</Link>
                </Button>
                <div className="ml-2">
                  <AdminLoginButton />
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden flex items-center px-2 py-1 border rounded text-gray-700 border-gray-300 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 bg-white/90 rounded-lg shadow-lg p-4 flex flex-col space-y-4">
            <Link href="/" className="text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link href="#" className="text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Courses
            </Link>
            <Link href="#" className="text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              About
            </Link>
            <Link href="#" className="text-base font-medium text-gray-700 hover:text-blue-600" onClick={() => setMenuOpen(false)}>
              Contact
            </Link>
            {user && userProfile ? (
              <Button variant="ghost" className="w-full" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign Out
              </Button>
            ) : (
              <>
                <Button
                  asChild
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full px-6 py-2 shadow-md hover:from-blue-600 hover:to-indigo-600 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none w-full"
                  onClick={() => setMenuOpen(false)}
                >
                  <Link href="/join">Join Now</Link>
                </Button>
                <div className="mt-2">
                  <AdminLoginButton />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;