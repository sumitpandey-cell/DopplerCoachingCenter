'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';

const ProgressBar = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    // We use a simple trick with pathname and searchParams to detect navigation
    // This is a common pattern for Next.js 13+ App Router
    handleStop(); // Ensure progress bar is hidden on initial load

    return () => {
      handleStop(); // Cleanup on unmount
    };
  }, [pathname, searchParams]);

  // The component itself doesn't render anything, it just manages the progress bar
  return null;
};

export default ProgressBar; 