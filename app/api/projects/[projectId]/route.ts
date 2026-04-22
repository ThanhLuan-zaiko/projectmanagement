// API Route: /api/projects/[projectId]
// GET - Get project by ID
// PATCH - Update project
// DELETE - Delete project

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { validateProjectFormData } from '@/lib/project-validation';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import type { ProjectFormData } from '@/types/project';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { projectId } = await params;
    const access = await requireProjectAccess(projectId, user.user_id, 'read', { includeDeleted: true });
    const project = access.project;

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
    return handleRouteError(error, 'Failed to fetch project');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { projectId } = await params;
    requireCsrf(request);
    const body = await parseJsonBody<ProjectFormData>(request);
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

    const access = await requireProjectAccess(projectId, user.user_id, 'manage', { includeDeleted: true });
    const project = access.project;

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
    return handleRouteError(error, 'Failed to update project');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { projectId } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    requireCsrf(request);

    const access = await requireProjectAccess(projectId, user.user_id, 'owner', { includeDeleted: true });
    const project = access.project;

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
    return handleRouteError(error, 'Failed to delete project');
  }
}
