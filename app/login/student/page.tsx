'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithStudentId, signIn } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, User, Lock, Mail } from 'lucide-react';
import Link from 'next/link';

export default function StudentLogin() {
  const [studentIdForm, setStudentIdForm] = useState({
    studentId: '',
    password: '',
  });
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleStudentIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setStudentIdForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleStudentIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithStudentId(studentIdForm.studentId, studentIdForm.password);
      router.push('/student/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid Student ID or password');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signIn(emailForm.email, emailForm.password);
      router.push('/student/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
            <GraduationCap className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Student Portal</CardTitle>
          <CardDescription>
            Access your Doppler Coaching account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student-id" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student-id">Student ID</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student-id">
              <form onSubmit={handleStudentIdLogin} className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="studentId"
                      name="studentId"
                      type="text"
                      value={studentIdForm.studentId}
                      onChange={handleStudentIdChange}
                      placeholder="Enter your Student ID (e.g., DPLR24001)"
                      required
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use the Student ID sent to your email by admin
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="student-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="student-password"
                      name="password"
                      type="password"
                      value={studentIdForm.password}
                      onChange={handleStudentIdChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In with Student ID'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="email">
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={emailForm.email}
                      onChange={handleEmailChange}
                      placeholder="Enter your email"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="email-password"
                      name="password"
                      type="password"
                      value={emailForm.password}
                      onChange={handleEmailChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In with Email'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert className="mt-4" variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-gray-600">
              Don't have a Student ID?{' '}
              <Link href="/join" className="text-blue-600 hover:underline">
                Apply for admission
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Student accounts are created by admin after admission approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}