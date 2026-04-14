// API Route: /api/projects/my-projects
// GET - Get all projects the current user is a member of

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';

// GET /api/projects/my-projects
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get team memberships
    const memberships = await projectTeamRepository.getUserProjects(user.user_id);

    // Get project details for each membership
    const projects = await Promise.all(
      memberships.map(async (membership) => {
        const project = await projectRepository.findById(membership.project_id);
        if (!project) return null;

        return {
          ...project,
          role: membership.role,
          joined_at: membership.joined_at,
        };
      })
    );

    // Filter out null values (projects that might have been deleted)
    const validProjects = projects.filter((p) => p !== null);

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
