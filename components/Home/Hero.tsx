'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Hero() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-12 lg:py-20 bg-gradient-to-br from-blue-50 to-green-50 min-h-[85vh] flex items-center overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            className="space-y-10"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div 
                className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                whileHover={{ scale: 1.05, backgroundColor: "#dbeafe" }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                🎯 India's #1 Trusted Coaching Institute
              </motion.div>
              <motion.h1 
                className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              >
                Transform Your{' '}
                <motion.span 
                  className="text-blue-600 relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  Future
                  <motion.div 
                    className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.8 }}
                  />
                </motion.span>
                {' '}with Expert Guidance
              </motion.h1>
              <motion.p 
                className="text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                Join thousands of successful students who achieved their dreams with our proven methodologies and personalized mentorship.
              </motion.p>
            </motion.div>

            <motion.div 
              className="flex flex-col sm:flex-row gap-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link href="/login/student">
                  <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-6 text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                Student Portal
              </Button>
                </Link>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <Link href="/login/faculty">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-2 border-gray-300 text-gray-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 hover:border-blue-300 px-10 py-6 text-xl font-semibold rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 backdrop-blur-sm"
                >
                  Faculty Portal
                </Button>
                </Link>
              </motion.div>
            </motion.div>

            <motion.div 
              className="flex items-center gap-8 pt-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.6 }}
            >
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-blue-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.2, type: "spring", stiffness: 500, damping: 25 }}
                >
                  10,000+
                </motion.div>
                <div className="text-sm text-gray-600">Students Enrolled</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-green-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.4, type: "spring", stiffness: 500, damping: 25 }}
                >
                  95%
                </motion.div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </motion.div>
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <motion.div 
                  className="text-3xl font-bold text-purple-600"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.6, type: "spring", stiffness: 500, damping: 25 }}
                >
                  15+
                </motion.div>
                <div className="text-sm text-gray-600">Years Experience</div>
              </motion.div>
            </motion.div>
          </motion.div>

          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <motion.div 
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02, rotateY: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
            >
              <img
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Students studying with focus and determination"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <motion.div 
                className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              />
              
              {/* Floating achievement card */}
              <motion.div 
                className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, scale: 0, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
              >
                <div className="text-center">
                  <motion.div 
                    className="text-2xl font-bold text-blue-600"
                    whileHover={{ scale: 1.1 }}
                  >
                    AIR 1
                  </motion.div>
                  <div className="text-sm text-gray-600">JEE Advanced</div>
                  <div className="text-xs text-gray-500 mt-1">Rohit Sharma</div>
                </div>
              </motion.div>

              {/* Floating stats card */}
              <motion.div 
                className="absolute bottom-8 left-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl"
                initial={{ opacity: 0, scale: 0, rotate: 10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 1.4, type: "spring", stiffness: 300, damping: 20 }}
                whileHover={{ scale: 1.05, rotate: -2 }}
              >
                <div className="flex items-center gap-4">
                  <motion.div 
                    className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    <span className="text-green-600 font-bold text-xl">📈</span>
                  </motion.div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">Top Results</div>
                    <div className="text-sm text-gray-600">This Year</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Decorative elements */}
            <motion.div 
              className="absolute -bottom-6 -left-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div 
              className="absolute -top-6 -right-6 w-40 h-40 bg-green-500/10 rounded-full blur-2xl"
              animate={{ 
                scale: [1.2, 1, 1.2],
                opacity: [0.6, 0.3, 0.6]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </motion.div>
        </div>
      </div>

      {/* <JoinNowModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} /> */}
    </section>
  );
}
