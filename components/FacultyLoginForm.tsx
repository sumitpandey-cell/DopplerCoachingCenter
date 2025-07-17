'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithFacultyId, signIn } from '@/firebase/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCheck, User, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function FacultyLoginForm() {
  const [facultyIdForm, setFacultyIdForm] = useState({
    facultyId: '',
    password: '',
  });
  const [emailForm, setEmailForm] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleFacultyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFacultyIdForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEmailForm(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleFacultyIdLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithFacultyId(facultyIdForm.facultyId, facultyIdForm.password);
      router.push('/faculty/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid Faculty ID or password');
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
      router.push('/faculty/dashboard');
    } catch (error: any) {
      setError(error.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Faculty Portal</CardTitle>
          <CardDescription>
            Access your Doppler Coaching faculty account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="faculty-id" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faculty-id">Faculty ID</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
            </TabsList>
            
            <TabsContent value="faculty-id">
              <form onSubmit={handleFacultyIdLogin} className="space-y-4">
                <div>
                  <Label htmlFor="facultyId">Faculty ID</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="facultyId"
                      name="facultyId"
                      type="text"
                      value={facultyIdForm.facultyId}
                      onChange={handleFacultyIdChange}
                      placeholder="Enter your Faculty ID (e.g., FAC001)"
                      required
                      className="pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use the Faculty ID provided by admin
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="faculty-password">Password</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="faculty-password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={facultyIdForm.password}
                      onChange={handleFacultyIdChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In with Faculty ID'}
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
                      type={showPassword ? 'text' : 'password'}
                      value={emailForm.password}
                      onChange={handleEmailChange}
                      placeholder="Enter your password"
                      required
                      className="pl-10 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
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
<<<<<<< HEAD
              Don&apos;t have a Faculty ID?{' '}
              <Link href="/join/faculty" className="text-green-600 hover:underline">
                Apply for a position
=======
              Don't have a Faculty ID?{' '}
              <Link href="/signup/faculty" className="text-green-600 hover:underline">
                Sign Up
>>>>>>> master
              </Link>
            </p>
            <p className="text-xs text-gray-500">
              Faculty accounts are created by admin after application approval
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}