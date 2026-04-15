// API Route: /api/projects/[projectId]
// GET - Get project by ID
// PATCH - Update project
// DELETE - Delete project

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { validateProjectFormData } from '@/lib/project-validation';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;

    const project = await projectRepository.findById(projectId, { includeDeleted: true });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    const membership = await projectTeamRepository.getMemberRole(projectId, user.user_id);
    const isOwner = project.owner_id === user.user_id;

    if (!isOwner && (!membership || !membership.is_active)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (project.is_deleted && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get team members
    const teamMembers = await projectTeamRepository.getProjectTeam(projectId);

    return NextResponse.json({
      success: true,
      data: {
        ...project,
        team_members: teamMembers,
      },
    });
  } catch (error) {
    console.error('Error fetching project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const body = await request.json();
    const validation = validateProjectFormData(body);

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted project fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }

    const sanitizedBody = validation.sanitizedData;

    // Check if project exists
    const project = await projectRepository.findById(projectId, { includeDeleted: true });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is owner or has permission
    if (project.owner_id !== user.user_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (project.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Restore the project before editing it' },
        { status: 400 }
      );
    }

    // Update project
    const updatedProject = await projectRepository.updateProject(projectId, {
      project_name: sanitizedBody.project_name,
      description: sanitizedBody.description,
      status: sanitizedBody.status,
      project_leader_id: body.project_leader_id,
      start_date: sanitizedBody.start_date ? new Date(sanitizedBody.start_date) : null,
      target_end_date: sanitizedBody.target_end_date ? new Date(sanitizedBody.target_end_date) : null,
      budget: sanitizedBody.budget,
      currency: sanitizedBody.currency,
    });

    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully',
    });
  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    // Check if project exists
    const project = await projectRepository.findById(projectId, { includeDeleted: true });
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user is owner
    if (project.owner_id !== user.user_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (permanent) {
      await projectRepository.deleteProject(projectId);

      return NextResponse.json({
        success: true,
        message: 'Project permanently deleted',
      });
    }

    if (project.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Project is already in trash' },
        { status: 400 }
      );
    }

    await projectRepository.softDeleteProject(projectId, user.user_id);

    return NextResponse.json({
      success: true,
      message: 'Project moved to trash',
    });
  } catch (error) {
    console.error('Error deleting project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project' },
      { status: 500 }
    );
  }
}
