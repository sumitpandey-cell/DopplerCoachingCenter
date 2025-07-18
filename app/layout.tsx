import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '@/contexts/AuthContext';
import NavbarWrapper from '@/components/NavbarWrapper';
import Footer from '@/components/Footer';
import { LoaderOverlay } from '@/components/ui/loader';
import { Suspense } from 'react';


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
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <NavbarWrapper />
            <main className="flex-1">
              <Suspense fallback={<LoaderOverlay />}>{children}</Suspense>
            </main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
