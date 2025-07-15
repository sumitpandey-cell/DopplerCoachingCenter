import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './config';

export interface AdminLoginResult {
  success: boolean;
  requiresTwoFactor?: boolean;
  error?: string;
  user?: any;
}

// Demo admin credentials - In production, this should be properly secured
const DEMO_ADMIN = {
  email: 'admin@dopplercoaching.com',
  password: 'admin123',
  twoFactorEnabled: true,
  validCodes: ['123456', '000000'] // Demo codes
};

export const adminLogin = async (
  email: string, 
  password: string, 
  twoFactorCode?: string
): Promise<AdminLoginResult> => {
  try {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo authentication logic
    if (email === DEMO_ADMIN.email && password === DEMO_ADMIN.password) {
      if (DEMO_ADMIN.twoFactorEnabled && !twoFactorCode) {
        return {
          success: false,
          requiresTwoFactor: true
        };
      }

      if (DEMO_ADMIN.twoFactorEnabled && twoFactorCode) {
        if (!DEMO_ADMIN.validCodes.includes(twoFactorCode)) {
          return {
            success: false,
            error: 'Invalid two-factor authentication code'
          };
        }
      }

      // Store admin session
      sessionStorage.setItem('adminAuthenticated', 'true');
      sessionStorage.setItem('adminUser', JSON.stringify({
        email: DEMO_ADMIN.email,
        role: 'admin',
        loginTime: new Date().toISOString()
      }));

      return {
        success: true,
        user: {
          email: DEMO_ADMIN.email,
          role: 'admin'
        }
      };
    }

    return {
      success: false,
      error: 'Invalid email or password'
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

export const isAdminAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return sessionStorage.getItem('adminAuthenticated') === 'true';
};

export const getAdminUser = () => {
  if (typeof window === 'undefined') return null;
  const userStr = sessionStorage.getItem('adminUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const adminLogout = () => {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('adminAuthenticated');
  sessionStorage.removeItem('adminUser');
  localStorage.removeItem('adminRememberMe');
};