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


export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Admin Access Button - Top Right */}
      <div className="absolute top-4 right-4 z-10">
        <AdminLoginButton />
      </div>
      
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex justify-center mb-8">
            <GraduationCap className="h-20 w-20 text-blue-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Doppler</span> Coaching
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Excellence in education. Empowering students to achieve their dreams through 
            quality coaching, personalized attention, and comprehensive learning resources.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3">
              <Link href="/login/student">Student Portal</Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
              <Link href="/login/faculty">Faculty Portal</Link>
            </Button>
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <Link href="/join/faculty" className="text-green-600 hover:underline">
              Apply as Faculty
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <Link href="/signup/student" className="text-blue-600 hover:underline">
              Student Signup
            </Link>
            <span className="hidden sm:inline text-gray-400">•</span>
            <Link href="/signup/faculty" className="text-green-600 hover:underline">
              Faculty Signup
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      {/* <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Comprehensive Learning Platform
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our digital platform provides everything students and faculty need for 
              effective teaching and learning.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <BookOpen className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Study Materials</CardTitle>
                <CardDescription>
                  Access comprehensive study materials, notes, and resources uploaded by faculty
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Monitor student progress with detailed analytics and performance insights
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Award className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Test Management</CardTitle>
                <CardDescription>
                  Schedule tests, enter scores, and track academic performance seamlessly
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Bell className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Announcements</CardTitle>
                <CardDescription>
                  Stay updated with important notices and announcements from faculty
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Student Management</CardTitle>
                <CardDescription>
                  Faculty can easily manage students, track progress, and provide feedback
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Timetable</CardTitle>
                <CardDescription>
                  View class schedules, timings, and stay organized with digital timetables
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section> */}
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
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Learning Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have achieved success with Doppler Coaching
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-3">
              <Link href="/join">Join Now - Apply Today</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-3 text-white border-white hover:bg-white hover:text-blue-600">
              <Link href="/login/faculty">Faculty Login</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
