// API Route: /api/projects/join
// POST - Join a project using project code

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';

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

    if (!body.project_code) {
      return NextResponse.json(
        { success: false, error: 'Project code is required' },
        { status: 400 }
      );
    }

    // Find project by code
    const project = await projectRepository.findByCode(body.project_code);
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
      'member',
      user.user_id // added_by
    );

    return NextResponse.json({
      success: true,
      data: {
        project,
        role: 'member',
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
