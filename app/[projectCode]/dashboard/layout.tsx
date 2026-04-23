'use client';

import { ReactNode } from 'react';
import { useProject } from '@/app/[projectCode]/layout';
import { DashboardLayout } from '@/components/layout';

interface DashboardSubLayoutProps {
  children: ReactNode;
}

export default function DashboardSubLayout({ children }: DashboardSubLayoutProps) {
  const { project } = useProject();

  if (!project) {
    return (
      <div className="theme-projects-shell min-h-screen flex items-center justify-center text-slate-100">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
