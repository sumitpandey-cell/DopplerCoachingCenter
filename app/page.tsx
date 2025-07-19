import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import AdminLoginButton from '@/components/AdminLoginButton';
import { GraduationCap, Users, BookOpen, TrendingUp, Bell, Award } from 'lucide-react';
import WhyChooseUs from '@/components/Home/WhyChooseUs';
import OurTopCourses from '@/components/Home/OurTopCourses';
import Toppers from '@/components/Home/Toppers';
import Testimonials from '@/components/Home/Testimonials';
import Gallery from '@/components/Home/Gallery';
import Hero from '@/components/Home/Hero';
import Footer from '@/components/Footer';


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Admin Access Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <AdminLoginButton />
      </div>
      
     
      {/* Hero Section */}
       <Hero />

      {/* Why Choose Us Section */}
      <WhyChooseUs/>

      {/* Our Top Courses Section */}
       <OurTopCourses />

      {/* Toppers Section */}
      <Toppers/>

      {/* Testimonials Section */}
      <Testimonials/>

      {/* Gallery Section */}
      <Gallery />
        
      

      {/* CTA Section */}
      <section className="relative py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 overflow-hidden">
        {/* Subtle pattern or shape */}
        <div className="absolute inset-0 pointer-events-none">
          <svg width="100%" height="100%" className="opacity-10" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="1" cy="1" r="1" fill="#fff" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>
        <div className="relative max-w-3xl mx-auto">
          <div className="bg-white/95 rounded-3xl shadow-2xl p-10 md:p-16 text-center flex flex-col items-center border border-blue-100">
            <div className="flex items-center justify-center mb-2">
              <svg className="h-7 w-7 text-green-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <span className="text-base font-semibold text-green-600">Trusted by 10,000+ students</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-2 tracking-tight">
              Ready to Start Your <span className="text-blue-600">Learning Journey?</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-700 mb-2">
              Join thousands of students who have achieved success with Doppler Coaching
            </p>
            <p className="text-base text-gray-500 mb-8">Personalized mentorship, proven results, and a supportive community await you.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button asChild size="lg" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold rounded-full px-8 py-3 shadow-lg hover:from-blue-600 hover:to-indigo-600 hover:-translate-y-1 hover:shadow-2xl active:scale-95 transition-all duration-200 border-0 focus:ring-2 focus:ring-blue-300 focus:outline-none w-full sm:w-auto">
                <Link href="/join">Join Now - Apply Today</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 text-blue-700 border-blue-600 hover:bg-blue-50 hover:text-blue-800 font-bold rounded-full shadow-sm w-full sm:w-auto transition-all duration-200">
                <Link href="/login/faculty">Faculty Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
