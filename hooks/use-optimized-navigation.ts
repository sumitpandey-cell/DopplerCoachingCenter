import { useRouter, usePathname } from 'next/navigation';
import { useTransition, useCallback, useState, useEffect } from 'react';
import { RouteTransitionManager } from '@/lib/navigation-utils';

export const useOptimizedNavigation = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [currentPath, setCurrentPath] = useState(pathname);
  const [clickedPath, setClickedPath] = useState<string | null>(null);
  
  const transitionManager = RouteTransitionManager.getInstance();

  // Immediate visual feedback
  useEffect(() => {
    setCurrentPath(pathname);
    if (clickedPath) {
      transitionManager.completeTransition(clickedPath);
      setClickedPath(null);
    }
  }, [pathname, clickedPath, transitionManager]);

  // Optimized navigation with immediate feedback
  const navigate = useCallback((href: string, options?: { replace?: boolean }) => {
    // Immediate visual feedback
    setCurrentPath(href);
    setClickedPath(href);
    transitionManager.startTransition(href);
    
    startTransition(() => {
      if (options?.replace) {
        router.replace(href);
      } else {
        router.push(href);
      }
    });
  }, [router, transitionManager]);

  // Check if route is active (with immediate feedback)
  const isActive = useCallback((href: string) => {
    return currentPath === href || clickedPath === href;
  }, [currentPath, clickedPath]);

  // Check if specific route is pending
  const isRoutePending = useCallback((href: string) => {
    return transitionManager.isPending(href);
  }, [transitionManager]);

  return {
    navigate,
    isActive,
    isPending,
    isRoutePending,
    currentPath
  };
};