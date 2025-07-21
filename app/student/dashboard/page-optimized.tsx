'use client';

import dynamic from 'next/dynamic';
import { LoaderOverlay } from '@/components/ui/loader';

// Lazy load the optimized dashboard component
const OptimizedStudentDashboard = dynamic(
  () => import('@/components/optimized/OptimizedStudentDashboard'),
  {
    loading: () => <LoaderOverlay />,
    ssr: false, // Disable SSR for this component to improve initial load
  }
);

export default function StudentDashboardPage() {
  return <OptimizedStudentDashboard />;
}