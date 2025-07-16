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