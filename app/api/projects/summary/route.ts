import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getMemberProjectItems, getOwnedProjectItems } from '@/lib/project-service';

function toNumber(value: unknown) {
  if (value === null || value === undefined) {
    return 0;
  }

  const numericValue = Number(value);

  if (Number.isFinite(numericValue)) {
    return numericValue;
  }

  const parsedValue = parseFloat(String(value));
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function buildTimelineLabels() {
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (5 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}`;

    return {
      key,
      label: date.toLocaleString('en-US', {
        month: 'short',
      }),
      created: 0,
      completed: 0,
    };
  });
}

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const [ownedProjects, memberProjects] = await Promise.all([
      getOwnedProjectItems(user.user_id, { includeDeleted: true }),
      getMemberProjectItems(user.user_id, { includeDeleted: false }),
    ]);

    const activeOwnedProjects = ownedProjects.filter((project) => !project.is_deleted);
    const deletedProjects = ownedProjects.filter((project) => project.is_deleted);
    const collaboratingProjects = memberProjects.filter((project) => !project.is_deleted);
    const visibleProjects = [...activeOwnedProjects, ...collaboratingProjects];

    const statusLabels: Array<'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled'> = [
      'planning',
      'active',
      'on_hold',
      'completed',
      'cancelled',
    ];

    const statusDistribution = statusLabels
      .map((status) => ({
        name: status.replace('_', ' '),
        value: visibleProjects.filter((project) => project.status === status).length,
      }))
      .filter((item) => item.value > 0);

    const budgetDistribution = [...activeOwnedProjects]
      .sort((a, b) => toNumber(b.budget) - toNumber(a.budget))
      .slice(0, 6)
      .map((project) => ({
        name: project.project_name,
        budget: toNumber(project.budget),
        status: project.status,
      }));

    const timeline = buildTimelineLabels();

    visibleProjects.forEach((project) => {
      const createdAt = new Date(project.created_at);
      const createdKey = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
      const createdBucket = timeline.find((item) => item.key === createdKey);

      if (createdBucket) {
        createdBucket.created += 1;
      }

      if (project.status === 'completed') {
        const completedAt = new Date(project.actual_end_date || project.updated_at);
        const completedKey = `${completedAt.getFullYear()}-${completedAt.getMonth()}`;
        const completedBucket = timeline.find((item) => item.key === completedKey);

        if (completedBucket) {
          completedBucket.completed += 1;
        }
      }
    });

    const kpis = {
      total_projects: visibleProjects.length,
      owned_projects: activeOwnedProjects.length,
      collaborating_projects: collaboratingProjects.length,
      active_projects: visibleProjects.filter((project) => project.status === 'active').length,
      completed_projects: visibleProjects.filter((project) => project.status === 'completed').length,
      on_hold_projects: visibleProjects.filter((project) => project.status === 'on_hold').length,
      deleted_projects: deletedProjects.length,
      total_budget: activeOwnedProjects.reduce((total, project) => total + toNumber(project.budget), 0),
    };

    const recentProjects = [...visibleProjects]
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 5);

    const recentDeletedProjects = [...deletedProjects]
      .sort((a, b) => new Date(b.deleted_at || 0).getTime() - new Date(a.deleted_at || 0).getTime())
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        kpis,
        status_distribution: statusDistribution,
        budget_distribution: budgetDistribution,
        timeline: timeline.map((item) => ({
          label: item.label,
          created: item.created,
          completed: item.completed,
        })),
        recent_projects: recentProjects,
        recent_deleted_projects: recentDeletedProjects,
      },
    });
  } catch (error) {
    console.error('Error fetching project summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project summary' },
      { status: 500 }
    );
  }
}
