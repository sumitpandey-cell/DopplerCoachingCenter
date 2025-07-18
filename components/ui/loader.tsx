import React from 'react';

// Circular spinner loader
export function Loader({ className = '', size = 32 }: { className?: string; size?: number }) {
  return (
    <>
    <div
      className={`animate-spin rounded-full border-4 border-blue-300 border-t-blue-600 ${className}`}
      style={{ width: size, height: size, borderTopColor: '#2563eb' }}
      role="status"
      aria-label="Loading"
    />
    </>
  );
}

// Skeleton loader for cards, lists, etc.
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
  );
}

// Cool animated loader overlay
export function LoaderOverlay() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
      <div className="flex space-x-2">
        <span className="block w-4 h-4 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
        <span className="block w-4 h-4 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
        <span className="block w-4 h-4 bg-blue-300 rounded-full animate-bounce"></span>
      </div>
    </div>
  );
} 