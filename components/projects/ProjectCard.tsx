import {
  FiArrowRight,
  FiCalendar,
  FiClock,
  FiEdit2,
  FiFolder,
  FiHash,
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
  layout?: 'default' | 'compact';
  openLabel?: string;
  busy?: boolean;
  busyLabel?: string;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onTrash?: (project: Project) => void;
  onRestore?: (project: Project) => void;
  onPermanentDelete?: (project: Project) => void;
}

function formatRoleLabel(role?: Project['membership_role']) {
  if (!role) {
    return 'Member';
  }

  return role.replace('_', ' ');
}

export default function ProjectCard({
  project,
  variant = 'managed',
  layout = 'default',
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
  const accessLabel = variant === 'member' ? `Role ${formatRoleLabel(project.membership_role)}` : 'Owner control';
  const accessTone =
    variant === 'member'
      ? 'border-emerald-400/20 bg-emerald-400/12 text-emerald-200'
      : isTrash
        ? 'border-rose-400/20 bg-rose-400/12 text-rose-200'
        : 'border-cyan-400/20 bg-cyan-400/12 text-cyan-200';
  const lifecycleLabel = isTrash
    ? 'Deleted'
    : project.status === 'completed' && project.actual_end_date
      ? 'Completed'
      : 'Target end';
  const lifecycleValue = isTrash
    ? formatProjectDate(project.deleted_at)
    : project.status === 'completed' && project.actual_end_date
      ? formatProjectDate(project.actual_end_date)
      : formatProjectDate(project.target_end_date);
  const actionHint = isTrash
    ? 'Restore this workspace or remove it permanently when recovery is no longer needed.'
    : variant === 'member'
      ? 'Open the shared dashboard without taking over ownership.'
      : 'Open, edit, or retire this workspace from one compact rail.';

  const renderActionButtons = (buttonClassName: string) => (
    <>
      {canOpen && (
        <button
          type="button"
          onClick={() => onOpen?.(project)}
          disabled={busy}
          className={`${buttonClassName} border-cyan-400/20 text-white hover:border-cyan-400/35 disabled:cursor-not-allowed disabled:opacity-70`}
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
          className={`${buttonClassName} text-slate-200 hover:border-cyan-400/25 disabled:cursor-not-allowed disabled:opacity-70`}
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
          className={`${buttonClassName} border-rose-400/20 text-rose-200 hover:border-rose-400/35 disabled:cursor-not-allowed disabled:opacity-70`}
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
          className={`${buttonClassName} border-emerald-400/20 text-emerald-200 hover:border-emerald-400/35 disabled:cursor-not-allowed disabled:opacity-70`}
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
          className={`${buttonClassName} border-rose-400/20 text-rose-200 hover:border-rose-400/35 disabled:cursor-not-allowed disabled:opacity-70`}
        >
          {busy ? <FiLoader className="h-4 w-4 animate-spin" /> : <FiTrash2 className="h-4 w-4" />}
          <span>{busy ? busyLabel : 'Delete forever'}</span>
        </button>
      )}
    </>
  );

  if (layout === 'compact') {
    return (
      <article className="projects-bento-subpanel group rounded-[28px] p-5 backdrop-blur-xl transition hover:border-cyan-400/25 sm:p-6">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-[radial-gradient(circle_at_bottom_left,rgba(56,189,248,0.1),transparent_72%)] opacity-80" />
        <div className="relative space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-cyan-400/20 bg-cyan-400/12 text-cyan-300 shadow-[0_12px_24px_rgba(34,211,238,0.12)]">
                <FiFolder className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200">
                    <FiHash className="h-3.5 w-3.5" />
                    <span>{project.project_code}</span>
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${accessTone}`}>
                    {accessLabel}
                  </span>
                </div>

                <h3 className="line-clamp-2 max-w-2xl text-[1.35rem] font-semibold tracking-tight text-white sm:text-[1.5rem]">
                  {project.project_name}
                </h3>
              </div>
            </div>

            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusTone(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>

          <p className="line-clamp-2 max-w-2xl text-sm leading-6 text-slate-300">
            {project.description || 'No project description yet.'}
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="projects-bento-chip rounded-[20px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Budget</p>
              <p className="mt-3 text-base font-semibold text-white">{formatProjectBudget(project)}</p>
            </div>

            <div className="projects-bento-chip rounded-[20px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">{lifecycleLabel}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-white">
                <FiCalendar className="h-4 w-4 text-cyan-300" />
                <span>{lifecycleValue}</span>
              </p>
            </div>

            <div className="projects-bento-chip rounded-[20px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Team</p>
              <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-white">
                <FiUsers className="h-4 w-4 text-cyan-300" />
                <span>{project.team_size || 0} active</span>
              </p>
            </div>

            <div className="projects-bento-chip rounded-[20px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Updated</p>
              <p className="mt-3 text-base font-semibold text-white">{formatProjectDate(project.updated_at)}</p>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {project.start_date && !isTrash && (
                <span className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-300">
                  <FiCalendar className="h-3.5 w-3.5" />
                  <span>Started {formatProjectDate(project.start_date)}</span>
                </span>
              )}

              {project.membership_role && variant === 'member' && (
                <span className="projects-bento-chip inline-flex rounded-full px-3 py-1.5 capitalize text-slate-300">
                  Team role {formatRoleLabel(project.membership_role)}
                </span>
              )}

              {isTrash && project.deleted_at && (
                <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/12 px-3 py-1.5 text-rose-200">
                  Deleted {formatProjectDate(project.deleted_at)}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 lg:justify-end">
              {renderActionButtons(
                'projects-bento-chip inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-medium transition'
              )}
            </div>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="projects-bento-subpanel group rounded-[28px] p-5 backdrop-blur-xl transition hover:border-cyan-400/25 sm:p-6">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.14),transparent_62%)] opacity-70" />
      <div className="relative grid gap-5 xl:grid-cols-[minmax(0,1.72fr)_minmax(190px,0.46fr)]">
        <div className="min-w-0 space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border border-cyan-400/20 bg-cyan-400/12 text-cyan-300 shadow-[0_12px_24px_rgba(34,211,238,0.12)]">
                <FiFolder className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.24em] text-cyan-200">
                    <FiHash className="h-3.5 w-3.5" />
                    <span>{project.project_code}</span>
                  </span>
                  <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium capitalize ${accessTone}`}>
                    {accessLabel}
                  </span>
                </div>

                <h3 className="line-clamp-2 max-w-2xl text-[1.45rem] font-semibold tracking-tight text-white sm:text-[1.6rem]">
                  {project.project_name}
                </h3>
                <p className="mt-3 line-clamp-3 max-w-3xl text-sm leading-6 text-slate-300">
                  {project.description || 'No project description yet.'}
                </p>
              </div>
            </div>

            <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize ${getStatusTone(project.status)}`}>
              {getStatusLabel(project.status)}
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
            <div className="projects-bento-chip rounded-[22px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Budget</p>
              <p className="mt-3 text-base font-semibold text-white">{formatProjectBudget(project)}</p>
            </div>

            <div className="projects-bento-chip rounded-[22px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">{lifecycleLabel}</p>
              <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-white">
                <FiCalendar className="h-4 w-4 text-cyan-300" />
                <span>{lifecycleValue}</span>
              </p>
            </div>

            <div className="projects-bento-chip rounded-[22px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Team</p>
              <p className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-white">
                <FiUsers className="h-4 w-4 text-cyan-300" />
                <span>{project.team_size || 0} active</span>
              </p>
            </div>

            <div className="projects-bento-chip rounded-[22px] px-4 py-4">
              <p className="projects-bento-muted text-xs uppercase tracking-[0.2em]">Created</p>
              <p className="mt-3 text-base font-semibold text-white">{formatProjectDate(project.created_at)}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-300">
              <FiClock className="h-3.5 w-3.5" />
              <span>Updated {formatProjectDate(project.updated_at)}</span>
            </span>

            {project.start_date && !isTrash && (
              <span className="projects-bento-chip inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-slate-300">
                <FiCalendar className="h-3.5 w-3.5" />
                <span>Started {formatProjectDate(project.start_date)}</span>
              </span>
            )}

            {project.membership_role && variant === 'member' && (
              <span className="projects-bento-chip inline-flex rounded-full px-3 py-1.5 capitalize text-slate-300">
                Team role {formatRoleLabel(project.membership_role)}
              </span>
            )}

            {isTrash && project.deleted_at && (
              <span className="inline-flex rounded-full border border-rose-400/20 bg-rose-400/12 px-3 py-1.5 text-rose-200">
                Deleted {formatProjectDate(project.deleted_at)}
              </span>
            )}
          </div>
        </div>

        <aside className="projects-bento-panel flex flex-col justify-between gap-4 rounded-[24px] p-4">
          <div>
            <p className="projects-bento-kicker text-xs uppercase tracking-[0.24em]">Action rail</p>
            <p className="mt-3 line-clamp-4 text-sm leading-6 text-slate-300">{actionHint}</p>
          </div>

          <div className="flex flex-col gap-2 xl:mt-2">
            {renderActionButtons(
              'projects-bento-chip inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition'
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
