'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, Shield, AlertTriangle, Loader2 } from 'lucide-react';
import { adminLogin } from '@/firebase/admin-auth';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminLoginModal: React.FC<AdminLoginModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    twoFactorCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  
  const router = useRouter();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLocked && lockoutTime > 0) {
      interval = setInterval(() => {
        setLockoutTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            setFailedAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLocked, lockoutTime]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      setError(`Too many failed attempts. Please wait ${lockoutTime} seconds.`);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Simulate admin authentication
      const result = await adminLogin(formData.email, formData.password, formData.twoFactorCode);
      
      if (result.requiresTwoFactor && !showTwoFactor) {
        setShowTwoFactor(true);
        setLoading(false);
        return;
      }

      if (result.success) {
        // Store admin session
        if (rememberMe) {
          localStorage.setItem('adminRememberMe', 'true');
        }
        
        // Reset form and close modal
        setFormData({ email: '', password: '', twoFactorCode: '' });
        setShowTwoFactor(false);
        setFailedAttempts(0);
        onClose();
        
        // Redirect to admin dashboard
        router.push('/admin/dashboard');
      } else {
        throw new Error(result.error || 'Invalid credentials');
      }
    } catch (error: any) {
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);
      
      if (newFailedAttempts >= 3) {
        setIsLocked(true);
        setLockoutTime(30); // 30 second lockout
        setError('Too many failed attempts. Account locked for 30 seconds.');
      } else {
        setError(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', twoFactorCode: '' });
    setShowTwoFactor(false);
    setError('');
    setFailedAttempts(0);
    setIsLocked(false);
    setLockoutTime(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold">
            <Shield className="h-6 w-6 mr-2 text-blue-600" />
            Admin Authentication
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email / Username</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your admin email"
              required
              disabled={loading || isLocked}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative mt-1">
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                required
                disabled={loading || isLocked}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading || isLocked}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </Button>
            </div>
          </div>

          {showTwoFactor && (
            <div>
              <Label htmlFor="twoFactorCode">Two-Factor Authentication Code</Label>
              <Input
                id="twoFactorCode"
                name="twoFactorCode"
                type="text"
                value={formData.twoFactorCode}
                onChange={handleInputChange}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
                disabled={loading || isLocked}
                className="mt-1 text-center text-lg tracking-widest"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter the 6-digit code from your authenticator app
              </p>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              disabled={loading || isLocked}
            />
            <Label htmlFor="rememberMe" className="text-sm">
              Remember me for 30 days
            </Label>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {failedAttempts > 0 && failedAttempts < 3 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Warning: {failedAttempts}/3 failed attempts. Account will be locked after 3 failures.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || isLocked}
              className="flex-1"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : isLocked ? (
                `Locked (${lockoutTime}s)`
              ) : showTwoFactor ? (
                'Verify & Login'
              ) : (
                'Login'
              )}
            </Button>
          </div>
        </form>

        <div className="text-center pt-4 border-t">
          <p className="text-xs text-gray-500">
            Secure admin access with enterprise-grade authentication
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminLoginModal;