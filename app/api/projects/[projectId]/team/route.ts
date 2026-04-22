// API Route: /api/projects/[projectId]/team
// GET - Get project team members
// POST - Add team member
// PATCH - Update team member role
// DELETE - Remove team member

import { NextRequest, NextResponse } from 'next/server';
import { projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateTeamMemberPayload } from '@/lib/dashboard-validation';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { projectId } = await params;
    await requireProjectAccess(projectId, user.user_id, 'read');

    // Get team members
    const teamMembers = await projectTeamRepository.getProjectTeam(projectId);

    return NextResponse.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch team members');
  }
}

export async function POST(
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
    const body = await parseJsonBody(request);

    await requireProjectAccess(projectId, user.user_id, 'manage');

    const validation = validateTeamMemberPayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted team fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;

    // Add team member
    const teamMember = await projectTeamRepository.addMember(
      projectId,
      String(sanitizedBody.member_id),
      (sanitizedBody.role as 'owner' | 'manager' | 'member' | 'viewer') || 'member',
      user.user_id,
      (sanitizedBody.permissions as string[] | undefined) || []
    );

    return NextResponse.json({
      success: true,
      data: teamMember,
      message: 'Team member added successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to add team member');
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
    const body = await parseJsonBody(request);
    await requireProjectAccess(projectId, user.user_id, 'manage');

    const validation = validateTeamMemberPayload(body, 'updateRole');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted team fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;

    // Update role
    const updatedMember = await projectTeamRepository.updateMemberRole(
      projectId,
      String(sanitizedBody.member_id),
      sanitizedBody.role as 'owner' | 'manager' | 'member' | 'viewer'
    );

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Team member role updated',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update team member');
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
    const memberId = searchParams.get('member_id');
    requireCsrf(request);
    await requireProjectAccess(projectId, user.user_id, 'manage');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Remove team member
    await projectTeamRepository.removeMember(projectId, memberId);

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to remove team member');
  }
}
