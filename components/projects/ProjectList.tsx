import type { Project } from '@/types/project';
import { FiLoader } from 'react-icons/fi';
import ProjectCard from './ProjectCard';
import ProjectEmptyState from './ProjectEmptyState';
import ItemsPerPage from '@/components/dashboard/ItemsPerPage';

interface ProjectListProps {
  title: string;
  description: string;
  projects: Project[];
  variant?: 'managed' | 'member' | 'trash';
  cardLayout?: 'default' | 'compact';
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
  isRefreshing?: boolean;
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
  cardLayout = 'default',
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
  isRefreshing = false,
}: ProjectListProps) {
  return (
    <section className="projects-bento-panel rounded-[28px] p-6 backdrop-blur-xl sm:p-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
        </div>
        {pagination && onLimitChange && (
          <div className="flex shrink-0 items-center gap-3">
            {isRefreshing && (
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-200">
                <FiLoader className="h-3.5 w-3.5 animate-spin" />
                <span>Updating</span>
              </div>
            )}
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
              className="projects-bento-subpanel rounded-[26px] p-5 sm:p-6"
            >
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(230px,0.55fr)]">
                <div className="min-w-0 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 animate-pulse rounded-[18px] bg-white/5" />
                    <div className="min-w-0 flex-1">
                      <div className="flex gap-2">
                        <div className="h-7 w-28 animate-pulse rounded-full bg-white/5" />
                        <div className="h-7 w-24 animate-pulse rounded-full bg-white/5" />
                      </div>
                      <div className="mt-3 h-7 w-56 animate-pulse rounded bg-white/5" />
                      <div className="mt-3 h-10 w-full animate-pulse rounded bg-white/5" />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-20 animate-pulse rounded-[22px] bg-white/5" />
                    ))}
                  </div>

                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-8 w-28 animate-pulse rounded-full bg-white/5" />
                    ))}
                  </div>
                </div>
                <div className="hidden h-52 animate-pulse rounded-[24px] bg-white/5 xl:block" />
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
              layout={cardLayout}
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

      {pagination && (
        <div className="mt-6">
          <div className="projects-bento-subpanel flex flex-col items-center justify-between gap-4 rounded-2xl px-5 py-4 sm:flex-row">
            <div className="projects-bento-muted text-sm">
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
                  {' '}project{pagination.total === 1 ? '' : 's'}
                </>
              ) : (
                <>
                  Showing{' '}
                  <span className="font-medium text-white">0</span>{' '}projects
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
            {onPageChange && pagination.totalPages > 1 ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onPageChange(1)}
                  disabled={!pagination.hasPrevPage}
                  className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  First
                </button>
                <button
                  onClick={() => onPageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Prev
                </button>
                <span className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-cyan-200">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => onPageChange(pagination.page + 1)}
                  disabled={!pagination.hasNextPage}
                  className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
                <button
                  onClick={() => onPageChange(pagination.totalPages)}
                  disabled={!pagination.hasNextPage}
                  className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:border-cyan-400/20 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Last
                </button>
              </div>
            ) : (
              <div className="projects-bento-chip rounded-lg px-3 py-2 text-sm font-medium text-slate-300">
                Stable portfolio snapshot
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
