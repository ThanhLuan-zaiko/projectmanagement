'use client';

import { useState, useEffect, ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export default function ChartWrapper({ children, fallback, className }: ChartWrapperProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      fallback || (
        <div className={`animate-pulse bg-slate-700/30 rounded ${className || ''}`} />
      )
    );
  }

  return <>{children}</>;
}
