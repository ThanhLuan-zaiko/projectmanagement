import type { Project } from '@/types/project';

export function formatProjectDate(value?: string | null) {
  if (!value) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatProjectBudget(project: Project) {
  if (!project.budget) {
    return 'No budget';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: project.currency || 'USD',
    maximumFractionDigits: 0,
  }).format(Number(project.budget));
}

export function getStatusLabel(status: Project['status']) {
  return status.replace('_', ' ');
}

export function getStatusTone(status: Project['status']) {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20';
    case 'planning':
      return 'bg-sky-500/15 text-sky-300 border-sky-400/20';
    case 'on_hold':
      return 'bg-amber-500/15 text-amber-300 border-amber-400/20';
    case 'completed':
      return 'bg-violet-500/15 text-violet-300 border-violet-400/20';
    case 'cancelled':
    default:
      return 'bg-rose-500/15 text-rose-300 border-rose-400/20';
  }
}
