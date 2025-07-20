'use client';

import React, { memo, useCallback, useState } from 'react';
import Link from 'next/link';
import { useOptimizedNavigation } from '@/hooks/use-optimized-navigation';
import { cn } from '@/lib/utils';

interface OptimizedLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
  replace?: boolean;
  prefetch?: boolean;
}

const OptimizedLink = memo(({
  href,
  children,
  className,
  activeClassName,
  onClick,
  replace = false,
  prefetch = true,
  ...props
}: OptimizedLinkProps) => {
  const { navigate, isActive, isPending } = useOptimizedNavigation();
  const [isClicked, setIsClicked] = useState(false);
  
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    
    // Immediate visual feedback
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 150);
    
    // Custom onClick handler
    onClick?.();
    
    // Navigate with optimization
    navigate(href, { replace });
  }, [href, navigate, onClick, replace]);

  const active = isActive(href);
  const pending = isPending && isClicked;

  return (
    <Link
      href={href}
      onClick={handleClick}
      prefetch={prefetch}
      className={cn(
        className,
        active && activeClassName,
        pending && 'opacity-75 pointer-events-none',
        'transition-all duration-150'
      )}
      {...props}
    >
      {children}
    </Link>
  );
});

OptimizedLink.displayName = 'OptimizedLink';

export default OptimizedLink;