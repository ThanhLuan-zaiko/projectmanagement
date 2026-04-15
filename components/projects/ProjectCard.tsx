import {
  FiArrowRight,
  FiClock,
  FiEdit2,
  FiFolder,
  FiLoader,
  FiRotateCcw,
  FiTrash2,
  FiUsers,
} from 'react-icons/fi';
import type { Project } from '@/types/project';
import { formatProjectBudget, formatProjectDate, getStatusLabel, getStatusTone } from './project-utils';

interface ProjectCardProps {
  project: Project;
  variant?: 'managed' | 'member' | 'trash' | 'compact';
  openLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onTrash?: (project: Project) => void;
  onRestore?: (project: Project) => void;
  onPermanentDelete?: (project: Project) => void;
}

export default function ProjectCard({
  project,
  variant = 'managed',
  openLabel,
  busy = false,
  busyLabel = 'Working...',
  onOpen,
  onEdit,
  onTrash,
  onRestore,
  onPermanentDelete,
}: ProjectCardProps) {
  const isTrash = variant === 'trash';
  const canOpen = Boolean(onOpen) && (!isTrash || (!onRestore && !onPermanentDelete));

  return (
    <article className="group rounded-[26px] border border-white/10 bg-slate-950/55 p-5 backdrop-blur-xl transition hover:border-cyan-400/20 hover:bg-slate-950/70 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/12 text-cyan-300">
              <FiFolder className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-semibold text-white">{project.project_name}</p>
              <p className="truncate font-mono text-xs uppercase tracking-[0.22em] text-cyan-200/70">
                {project.project_code}
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusTone(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>

          <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-300">
            {project.description || 'No project description yet.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Budget</p>
              <p className="mt-2 text-sm font-medium text-white">{formatProjectBudget(project)}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Target end</p>
              <p className="mt-2 text-sm font-medium text-white">{formatProjectDate(project.target_end_date)}</p>
            </div>
            <div className="rounded-2xl border border-white/6 bg-white/[0.03] px-4 py-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Team</p>
              <p className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-white">
                <FiUsers className="h-4 w-4 text-cyan-300" />
                <span>{project.team_size || 0} active</span>
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span className="inline-flex items-center gap-2">
              <FiClock className="h-4 w-4" />
              Updated {formatProjectDate(project.updated_at)}
            </span>
            {project.membership_role && variant === 'member' && (
              <span className="rounded-full border border-white/10 px-3 py-1 capitalize text-slate-300">
                Role: {project.membership_role}
              </span>
            )}
            {isTrash && project.deleted_at && (
              <span className="rounded-full border border-rose-400/20 px-3 py-1 text-rose-200">
                Deleted {formatProjectDate(project.deleted_at)}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:w-44 lg:flex-col">
          {canOpen && (
            <button
              type="button"
              onClick={() => onOpen?.(project)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/8 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiArrowRight className="h-4 w-4" />
              <span>{openLabel || (isTrash ? 'Review' : 'Open')}</span>
            </button>
          )}

          {onEdit && !isTrash && (
            <button
              type="button"
              onClick={() => onEdit(project)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <FiEdit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}

          {onTrash && !isTrash && (
            <button
              type="button"
              onClick={() => onTrash(project)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
              <span>{busy ? busyLabel : 'Move to trash'}</span>
            </button>
          )}

          {onRestore && isTrash && (
            <button
              type="button"
              onClick={() => onRestore(project)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400/12 px-4 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/18 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiRotateCcw className="h-4 w-4" />}
              <span>{busy ? busyLabel : 'Restore'}</span>
            </button>
          )}

          {onPermanentDelete && isTrash && (
            <button
              type="button"
              onClick={() => onPermanentDelete(project)}
              disabled={busy}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-400/20 px-4 py-3 text-sm font-medium text-rose-200 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
              <span>{busy ? busyLabel : 'Delete forever'}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
