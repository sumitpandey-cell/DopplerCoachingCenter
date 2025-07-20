// Navigation utilities for optimized routing
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

// Cache for prefetched routes
const prefetchedRoutes = new Set<string>();

// Optimized navigation with immediate feedback
export const optimizedNavigate = (
  router: AppRouterInstance,
  href: string,
  options?: {
    onStart?: () => void;
    onComplete?: () => void;
    replace?: boolean;
  }
) => {
  // Immediate callback for UI feedback
  options?.onStart?.();
  
  // Use replace for better performance when appropriate
  if (options?.replace) {
    router.replace(href);
  } else {
    router.push(href);
  }
  
  // Completion callback
  setTimeout(() => {
    options?.onComplete?.();
  }, 100);
};

// Intelligent prefetching based on user behavior
export const intelligentPrefetch = (
  router: AppRouterInstance,
  routes: string[],
  priority: 'high' | 'medium' | 'low' = 'medium'
) => {
  const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
  
  setTimeout(() => {
    routes.forEach(route => {
      if (!prefetchedRoutes.has(route)) {
        router.prefetch(route);
        prefetchedRoutes.add(route);
      }
    });
  }, delay);
};

// Preload critical routes on app start
export const preloadCriticalRoutes = (router: AppRouterInstance, userRole: string) => {
  const criticalRoutes = {
    admin: [
      '/admin/dashboard',
      '/admin/students',
      '/admin/fees'
    ],
    student: [
      '/student/dashboard',
      '/student/materials',
      '/student/fees'
    ],
    faculty: [
      '/faculty/dashboard',
      '/faculty/students'
    ]
  };
  
  const routes = criticalRoutes[userRole as keyof typeof criticalRoutes] || [];
  intelligentPrefetch(router, routes, 'high');
};

// Debounced navigation for rapid clicks
let navigationTimeout: NodeJS.Timeout;

export const debouncedNavigate = (
  router: AppRouterInstance,
  href: string,
  delay: number = 150
) => {
  clearTimeout(navigationTimeout);
  
  navigationTimeout = setTimeout(() => {
    router.push(href);
  }, delay);
};

// Route transition manager
export class RouteTransitionManager {
  private static instance: RouteTransitionManager;
  private pendingTransitions = new Set<string>();
  
  static getInstance() {
    if (!RouteTransitionManager.instance) {
      RouteTransitionManager.instance = new RouteTransitionManager();
    }
    return RouteTransitionManager.instance;
  }
  
  startTransition(route: string) {
    this.pendingTransitions.add(route);
  }
  
  completeTransition(route: string) {
    this.pendingTransitions.delete(route);
  }
  
  isPending(route: string) {
    return this.pendingTransitions.has(route);
  }
  
  clearAll() {
    this.pendingTransitions.clear();
  }
}