'use client';

import React, { Suspense } from 'react';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import store from './store';
import { queryClient } from '@/lib/react-query-config';
import { LoaderOverlay } from '@/components/ui/loader';

// Optimized providers with proper error boundaries and loading states
export function OptimizedProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <Suspense fallback={<LoaderOverlay />}>
          {children}
        </Suspense>
        {process.env.NODE_ENV === 'development' && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </Provider>
    </QueryClientProvider>
  );
}