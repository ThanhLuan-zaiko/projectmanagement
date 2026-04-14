// API Route: /api/projects/[projectId]/team
// GET - Get project team members
// POST - Add team member
// PATCH - Update team member role
// DELETE - Remove team member

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
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

    // Check if project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Get team members
    const teamMembers = await projectTeamRepository.getProjectTeam(projectId);

    return NextResponse.json({
      success: true,
      data: teamMembers,
    });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch team members' },
      { status: 500 }
    );
  }
}

export async function POST(
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

    // Check if project exists
    const project = await projectRepository.findById(projectId);
    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    // Check if user has permission to add members (owner or manager)
    const currentUserRole = await projectTeamRepository.getMemberRole(projectId, user.user_id);
    if (!currentUserRole || !['owner', 'manager'].includes(currentUserRole.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    if (!body.member_id) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Add team member
    const teamMember = await projectTeamRepository.addMember(
      projectId,
      body.member_id,
      body.role || 'member',
      user.user_id,
      body.permissions || []
    );

    return NextResponse.json({
      success: true,
      data: teamMember,
      message: 'Team member added successfully',
    });
  } catch (error) {
    console.error('Error adding team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add team member' },
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

    if (!body.member_id || !body.role) {
      return NextResponse.json(
        { success: false, error: 'Member ID and role are required' },
        { status: 400 }
      );
    }

    // Check if user has permission
    const currentUserRole = await projectTeamRepository.getMemberRole(projectId, user.user_id);
    if (!currentUserRole || !['owner', 'manager'].includes(currentUserRole.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update role
    const updatedMember = await projectTeamRepository.updateMemberRole(
      projectId,
      body.member_id,
      body.role
    );

    return NextResponse.json({
      success: true,
      data: updatedMember,
      message: 'Team member role updated',
    });
  } catch (error) {
    console.error('Error updating team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update team member' },
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
    const memberId = searchParams.get('member_id');

    if (!memberId) {
      return NextResponse.json(
        { success: false, error: 'Member ID is required' },
        { status: 400 }
      );
    }

    // Check if user has permission
    const currentUserRole = await projectTeamRepository.getMemberRole(projectId, user.user_id);
    if (!currentUserRole || !['owner', 'manager'].includes(currentUserRole.role)) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Remove team member
    await projectTeamRepository.removeMember(projectId, memberId);

    return NextResponse.json({
      success: true,
      message: 'Team member removed successfully',
    });
  } catch (error) {
    console.error('Error removing team member:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove team member' },
      { status: 500 }
    );
  }
}
