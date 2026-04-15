// API Route: /api/projects/join
// POST - Join a project using project code

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { validateProjectCode } from '@/lib/project-validation';

// POST /api/projects/join
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const codeValidation = validateProjectCode(body.project_code || '');

    if (codeValidation.error) {
      return NextResponse.json(
        {
          success: false,
          error: codeValidation.error,
          fieldErrors: {
            project_code: codeValidation.error,
          },
        },
        { status: 400 }
      );
    }

    // Find project by code
    const project = await projectRepository.findByCode(codeValidation.value);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMember = await projectTeamRepository.getMemberRole(
      project.project_id,
      user.user_id
    );
    const membershipRole = project.owner_id === user.user_id ? 'owner' : 'member';
    const permissions =
      membershipRole === 'owner'
        ? ['project:manage', 'project:delete', 'project:restore', 'team:manage']
        : [];

    if (existingMember && existingMember.is_active) {
      return NextResponse.json({
        success: true,
        data: {
          project,
          role: existingMember.role,
        },
        message: 'Already a member of this project',
      });
    }

    // Add user to project team with 'member' role
    await projectTeamRepository.addMember(
      project.project_id,
      user.user_id,
      membershipRole,
      user.user_id,
      permissions
    );

    return NextResponse.json({
      success: true,
      data: {
        project,
        role: membershipRole,
      },
      message: 'Joined project successfully',
    });
  } catch (error) {
    console.error('Error joining project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to join project' },
      { status: 500 }
    );
  }
}
