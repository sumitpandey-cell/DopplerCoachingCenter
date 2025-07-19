'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-blue-50 to-green-50 min-h-[85vh] flex items-center">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-10">
            <div className="space-y-6">
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
                🎯 India's #1 Trusted Coaching Institute
              </div>
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Transform Your{' '}
                <span className="text-blue-600 relative">
                  Future
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600/20 rounded-full"></div>
                </span>
                {' '}with Expert Guidance
              </h1>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl">
                Join thousands of successful students who achieved their dreams with our proven methodologies and personalized mentorship.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
            <Link href="/login/student">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                
              >
                Student Portal
              </Button>
              </Link>
              <Link href="/login/faculty">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-10 py-6 text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Faculty Portal
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">10,000+</div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">95%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">15+</div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Students studying with focus and determination"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              
              {/* Floating achievement card */}
              <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">AIR 1</div>
                  <div className="text-sm text-gray-600">JEE Advanced</div>
                  <div className="text-xs text-gray-500 mt-1">Rohit Sharma</div>
                </div>
              </div>

              {/* Floating stats card */}
              <div className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-xl">📈</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Top Results</div>
                    <div className="text-sm text-gray-600">This Year</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
            <div className="absolute -top-6 -right-6 w-40 h-40 bg-green-500/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>

      {/* <JoinNowModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
    </section>
  );
}
