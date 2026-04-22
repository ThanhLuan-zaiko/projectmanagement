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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900">
        <div className="text-white text-xl">Loading project...</div>
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
