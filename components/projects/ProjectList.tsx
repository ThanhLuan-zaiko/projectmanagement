import type { Project } from '@/types/project';
import ProjectCard from './ProjectCard';
import ProjectEmptyState from './ProjectEmptyState';
import ItemsPerPage from '@/components/dashboard/ItemsPerPage';

interface ProjectListProps {
  title: string;
  description: string;
  projects: Project[];
  variant?: 'managed' | 'member' | 'trash';
  openLabel?: string;
  emptyTitle: string;
  emptyDescription: string;
  busyProjectId?: string | null;
  busyAction?: string | null;
  onOpen?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onTrash?: (project: Project) => void;
  onRestore?: (project: Project) => void;
  onPermanentDelete?: (project: Project) => void;
  // Pagination
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  onPageChange?: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  // Loading
  loading?: boolean;
}

function deduplicateProjects(projects: Project[]): Project[] {
  const seen = new Set<string>();
  return projects.filter((project) => {
    if (seen.has(project.project_id)) {
      return false;
    }
    seen.add(project.project_id);
    return true;
  });
}

export default function ProjectList({
  title,
  description,
  projects,
  variant = 'managed',
  openLabel,
  emptyTitle,
  emptyDescription,
  busyProjectId,
  busyAction,
  onOpen,
  onEdit,
  onTrash,
  onRestore,
  onPermanentDelete,
  pagination,
  onPageChange,
  onLimitChange,
  loading = false,
}: ProjectListProps) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-slate-950/55 p-6 backdrop-blur-xl shadow-xl shadow-slate-950/30 sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {pagination && onLimitChange && (
          <div className="shrink-0">
            <ItemsPerPage
              value={pagination.limit}
              onChange={onLimitChange}
            />
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-[26px] border border-white/10 bg-slate-950/55 p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 animate-pulse rounded-2xl bg-white/5" />
                    <div className="flex-1">
                      <div className="h-5 w-48 animate-pulse rounded bg-white/5" />
                      <div className="mt-2 h-3 w-32 animate-pulse rounded bg-white/5" />
                    </div>
                  </div>
                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/5" />
                  <div className="mt-5 grid gap-3 sm:grid-cols-3">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-14 animate-pulse rounded-2xl bg-white/5" />
                    ))}
                  </div>
                </div>
                <div className="hidden h-36 w-44 animate-pulse rounded-2xl bg-white/5 lg:block" />
              </div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        <ProjectEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className="space-y-4">
          {deduplicateProjects(projects).map((project) => (
            <ProjectCard
              key={project.project_id}
              project={project}
              variant={variant}
              openLabel={openLabel}
              busy={busyProjectId === project.project_id}
              busyLabel={busyAction === 'restore' ? 'Restoring...' : busyAction === 'permanent' ? 'Deleting...' : 'Moving...'}
              onOpen={onOpen}
              onEdit={onEdit}
              onTrash={onTrash}
              onRestore={onRestore}
              onPermanentDelete={onPermanentDelete}
            />
          ))}
        </div>
      )}

      {pagination && onPageChange && pagination.totalPages > 1 && (
        <div className="mt-6">
          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 sm:flex-row">
            <div className="text-sm text-slate-400">
              {pagination.total > 0 ? (
                <>
                  Showing{' '}
                  <span className="font-medium text-white">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>
                  {' '}to{' '}
                  <span className="font-medium text-white">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>
                  {' '}of{' '}
                  <span className="font-medium text-white">{pagination.total}</span>
                  {' '}projects
                </>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-white">0</span>
                  {' '}projects
                </>
              )}
              {pagination.totalPages > 1 && (
                <>
                  {' '}\u00b7 Page{' '}
                  <span className="font-medium text-white">{pagination.page}</span>
                  {' '}of{' '}
                  <span className="font-medium text-white">{pagination.totalPages}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                First
              </button>
              <button
                onClick={() => onPageChange(pagination.page - 1)}
                disabled={!pagination.hasPrevPage}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="rounded-lg bg-cyan-400/10 px-3 py-2 text-sm font-medium text-cyan-200">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange(pagination.page + 1)}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
              <button
                onClick={() => onPageChange(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Last
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
