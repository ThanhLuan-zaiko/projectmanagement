// API Route: /api/projects/my-projects
// GET - Get all projects the current user is a member of

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getProjectPortfolio } from '@/lib/project-service';

// GET /api/projects/my-projects
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const portfolio = await getProjectPortfolio(user.user_id, {
      scope: 'all',
      limit: 1000,
      sortBy: 'updated_at',
      sortOrder: 'desc',
    });

    const validProjects = portfolio.items.map((project) => ({
      ...project,
      role: project.membership_role || 'owner',
    }));

    return NextResponse.json({
      success: true,
      data: validProjects,
    });
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}
