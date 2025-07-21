import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { OptimizedProviders } from './providers-optimized';
import { preloadCriticalResources } from '@/lib/performance-utils';

export const metadata: Metadata = {
  title: 'Doppler Coaching Center',
  description: 'Excellence in education - Student and Faculty Portal',
  // Performance optimizations
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  // Preload critical resources
  other: {
    'preload': '/fonts/inter-var.woff2',
  },
};

// Preload critical resources on app start
if (typeof window !== 'undefined') {
  preloadCriticalResources();
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preload critical resources */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//images.pexels.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <OptimizedProviders>
          <AuthProvider>
            <div className="min-h-screen flex flex-col">
              <NavbarWrapper />
              <main className="flex-1">
                <Suspense fallback={<LoaderOverlay />}>
                  {children}
                </Suspense>
              </main>
            </div>
          </AuthProvider>
        </OptimizedProviders>
      </body>
    </html>
  );
}