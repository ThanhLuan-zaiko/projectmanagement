'use client';

import { useEffect, useRef, useState } from 'react';
import { FiCheck, FiDownload, FiLoader, FiXCircle } from 'react-icons/fi';

interface DashboardExportButtonProps {
  onExport: () => Promise<void> | void;
  disabled?: boolean;
  label?: string;
}

type ExportState = 'idle' | 'loading' | 'success' | 'error';

export default function DashboardExportButton({
  onExport,
  disabled = false,
  label = 'Export CSV',
}: DashboardExportButtonProps) {
  const [state, setState] = useState<ExportState>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleExport = async () => {
    if (disabled || state === 'loading') {
      return;
    }

    try {
      setState('loading');
      await onExport();
      setState('success');
    } catch (error) {
      console.error('CSV export failed:', error);
      setState('error');
    } finally {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = window.setTimeout(() => {
        setState('idle');
      }, 2200);
    }
  };

  const isBusy = state === 'loading';

  const content =
    state === 'loading'
      ? { icon: <FiLoader className="h-4 w-4 animate-spin" />, text: 'Exporting' }
      : state === 'success'
        ? { icon: <FiCheck className="h-4 w-4" />, text: 'Exported' }
        : state === 'error'
          ? { icon: <FiXCircle className="h-4 w-4" />, text: 'Retry export' }
          : { icon: <FiDownload className="h-4 w-4" />, text: label };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled || isBusy}
      aria-live="polite"
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-slate-100 transition duration-200 hover:border-cyan-400/40 hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {content.icon}
      <span>{content.text}</span>
    </button>
  );
}
