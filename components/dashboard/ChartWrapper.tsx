'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface ChartWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export default function ChartWrapper({ children, fallback, className }: ChartWrapperProps) {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || typeof ResizeObserver === 'undefined') {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];

      if (!entry) {
        return;
      }

      const { width, height } = entry.contentRect;

      if (width > 0 && height > 0) {
        setIsReady(true);
      }
    });

    observer.observe(containerRef.current);

    // Check initial size in case it's already available
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setIsReady(true);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {isReady ? children : fallback ?? <div className="h-full min-h-[20rem] w-full animate-pulse rounded-[24px] bg-slate-700/30" />}
    </div>
  );
}
