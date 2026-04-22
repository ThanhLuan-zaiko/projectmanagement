import { FiLoader } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface ProjectsPageHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  icon: IconType;
  action?: React.ReactNode;
  isRefreshing?: boolean;
  highlights?: Array<{
    label: string;
    value: string | number;
  }>;
}

export default function ProjectsPageHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
  action,
  isRefreshing = false,
  highlights = [],
}: ProjectsPageHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(8,47,73,0.88),rgba(2,6,23,0.96)_52%,rgba(15,23,42,0.92))] p-6 shadow-[0_30px_80px_rgba(2,6,23,0.42)] backdrop-blur-xl sm:p-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_24%)]" />
      <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-300 to-blue-500 text-slate-950 shadow-lg shadow-cyan-500/25">
            <Icon className="h-7 w-7" />
          </div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-[0.24em] text-cyan-200/70">{eyebrow}</p>
            <h2 className="mt-2 max-w-4xl text-2xl font-semibold text-white sm:text-3xl lg:text-[2rem]">{title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300 sm:text-base">{description}</p>

            {highlights.length > 0 && (
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {highlights.map((highlight) => (
                  <div
                    key={highlight.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 backdrop-blur"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-100/60">{highlight.label}</p>
                    <p className="mt-2 text-sm font-medium text-white sm:text-base">{highlight.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="relative flex shrink-0 flex-col items-start gap-3 self-start">
          {isRefreshing && (
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.14em] text-cyan-100">
              <FiLoader className="h-3.5 w-3.5 animate-spin" />
              <span>Syncing</span>
            </div>
          )}
          {action}
        </div>
      </div>
    </section>
  );
}
