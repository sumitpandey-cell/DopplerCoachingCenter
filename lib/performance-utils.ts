// Performance utilities for monitoring and optimization
import { useEffect, useRef, useCallback } from 'react';

// Performance monitoring utilities
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();

  static getInstance() {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure component render time
  measureRender(componentName: string, renderTime: number) {
    if (!this.metrics.has(componentName)) {
      this.metrics.set(componentName, []);
    }
    this.metrics.get(componentName)!.push(renderTime);
  }

  // Get average render time for a component
  getAverageRenderTime(componentName: string): number {
    const times = this.metrics.get(componentName) || [];
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  // Log performance metrics
  logMetrics() {
    console.group('🚀 Performance Metrics');
    this.metrics.forEach((times, component) => {
      const avg = this.getAverageRenderTime(component);
      const max = Math.max(...times);
      const min = Math.min(...times);
      console.log(`${component}: avg=${avg.toFixed(2)}ms, max=${max.toFixed(2)}ms, min=${min.toFixed(2)}ms`);
    });
    console.groupEnd();
  }
}

// Hook for measuring component performance
export const usePerformanceMonitor = (componentName: string) => {
  const startTime = useRef<number>();
  const monitor = PerformanceMonitor.getInstance();

  useEffect(() => {
    startTime.current = performance.now();
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        monitor.measureRender(componentName, renderTime);
      }
    };
  });

  return monitor;
};

// Debounce hook for search inputs
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Throttle hook for scroll events
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef<number>(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    }) as T,
    [callback, delay]
  );
};

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options?: IntersectionObserverInit
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsIntersecting(entry.isIntersecting),
      options
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [elementRef, options]);

  return isIntersecting;
};

// Bundle analyzer utility
export const analyzeBundleSize = () => {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    console.group('📦 Bundle Analysis');
    console.log('Total Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
    
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const totalJSSize = jsResources.reduce((total, resource) => {
      return total + (resource.transferSize || 0);
    }, 0);
    
    console.log('Total JS Size:', (totalJSSize / 1024 / 1024).toFixed(2), 'MB');
    console.groupEnd();
  }
};

// Memory usage monitoring
export const useMemoryMonitor = () => {
  useEffect(() => {
    const logMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: (memory.usedJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          total: (memory.totalJSHeapSize / 1024 / 1024).toFixed(2) + ' MB',
          limit: (memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2) + ' MB'
        });
      }
    };

    const interval = setInterval(logMemoryUsage, 30000); // Log every 30 seconds
    return () => clearInterval(interval);
  }, []);
};

// Image optimization utility
export const optimizeImageUrl = (url: string, width?: number, quality?: number) => {
  if (!url) return url;
  
  // For external URLs (like Pexels), add optimization parameters
  if (url.includes('pexels.com') || url.includes('unsplash.com')) {
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (quality) params.set('q', quality.toString());
    params.set('auto', 'format');
    
    return `${url}?${params.toString()}`;
  }
  
  return url;
};

// Preload critical resources
export const preloadCriticalResources = () => {
  const criticalResources = [
    '/fonts/inter-var.woff2',
    '/images/hero-bg.webp',
    // Add other critical resources
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.includes('.woff') ? 'font' : 'image';
    if (link.as === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
};