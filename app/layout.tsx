import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';
import { ReduxProvider } from './providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProgressBar from '@/components/ProgressBar';

export const metadata: Metadata = {
  title: 'Doppler Coaching Center',
  description: 'Excellence in education - Student and Faculty Portal',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <ReduxProvider>
            <AuthProvider>
              <div className="min-h-screen flex flex-col">
                <Suspense fallback={null}>
                  <ProgressBar />
                </Suspense>
                <NavbarWrapper />
                <main className="flex-1">
                  <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
                </main>
              </div>
            </AuthProvider>
          </ReduxProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
