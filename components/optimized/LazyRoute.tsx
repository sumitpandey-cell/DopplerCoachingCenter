'use client';

import React, { Suspense, lazy } from 'react';
import { LoaderOverlay } from '@/components/ui/loader';
import { usePerformanceMonitor } from '@/lib/performance-utils';

// Higher-order component for lazy loading routes
export function withLazyLoading<T extends Record<string, any>>(
  importFn: () => Promise<{ default: React.ComponentType<T> }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);
  
  return function LazyRoute(props: T) {
    const monitor = usePerformanceMonitor('LazyRoute');
    
    return (
      <Suspense fallback={fallback || <LoaderOverlay />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Preload component for better UX
export function preloadComponent(importFn: () => Promise<any>) {
  return importFn();
}

// Route-based code splitting components
export const LazyAdminDashboard = withLazyLoading(
  () => import('@/app/admin/dashboard/page')
);

export const LazyAdminStudents = withLazyLoading(
  () => import('@/app/admin/students/page')
);

export const LazyAdminFees = withLazyLoading(
  () => import('@/app/admin/fees/page')
);

export const LazyStudentDashboard = withLazyLoading(
  () => import('@/components/optimized/OptimizedStudentDashboard')
);

export const LazyStudentMaterials = withLazyLoading(
  () => import('@/app/student/materials/page')
);

export const LazyStudentFees = withLazyLoading(
  () => import('@/app/student/fees/page')
);

export const LazyFacultyDashboard = withLazyLoading(
  () => import('@/app/faculty/dashboard/page')
);

// Preload critical routes based on user role
export const preloadCriticalRoutes = (userRole: string) => {
  switch (userRole) {
    case 'admin':
      preloadComponent(() => import('@/app/admin/dashboard/page'));
      preloadComponent(() => import('@/app/admin/students/page'));
      break;
    case 'student':
      preloadComponent(() => import('@/components/optimized/OptimizedStudentDashboard'));
      preloadComponent(() => import('@/app/student/materials/page'));
      break;
    case 'faculty':
      preloadComponent(() => import('@/app/faculty/dashboard/page'));
      preloadComponent(() => import('@/app/faculty/students/page'));
      break;
  }
};