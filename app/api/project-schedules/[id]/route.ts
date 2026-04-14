// API Route: /api/project-schedules/[id]
// GET - Get a specific project schedule
// PUT - Update a project schedule
// DELETE - Delete a project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/project-schedules/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const schedule = await projectScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Project schedule not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    console.error('Error fetching project schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project schedule' },
      { status: 500 }
    );
  }
}

// PUT /api/project-schedules/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    // Validate required fields for composite key
    if (!body.project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const schedule = await projectScheduleRepository.findById(id, { params: [body.project_id] });
    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Project schedule not found' },
        { status: 404 }
      );
    }

    // Validate date range if dates are provided
    if (body.start_date && body.end_date) {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      if (endDate < startDate) {
        return NextResponse.json(
          { success: false, error: 'End date must be after start date' },
          { status: 400 }
        );
      }
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: body.project_id,
    };

    if (body.schedule_name !== undefined) updateData.schedule_name = body.schedule_name;
    if (body.schedule_type !== undefined) updateData.schedule_type = body.schedule_type;
    if (body.start_date !== undefined) updateData.start_date = new Date(body.start_date);
    if (body.end_date !== undefined) updateData.end_date = new Date(body.end_date);
    if (body.status !== undefined) updateData.status = body.status;
    if (body.progress_percentage !== undefined) updateData.progress_percentage = body.progress_percentage;
    if (body.parent_schedule_id !== undefined) updateData.parent_schedule_id = body.parent_schedule_id || null;

    const updatedSchedule = await projectScheduleRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: 'Project schedule updated successfully',
    });
  } catch (error) {
    console.error('Error updating project schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update project schedule' },
      { status: 500 }
    );
  }
}

// DELETE /api/project-schedules/[id]
// Soft delete by default, use ?permanent=true for hard delete
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const body = await request.json();

    if (!body.project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const schedule = await projectScheduleRepository.findById(id, { params: [body.project_id] });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Project schedule not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Hard delete - permanently remove
      await projectScheduleRepository.hardDelete(id, {
        project_id: body.project_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Project schedule permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await projectScheduleRepository.softDelete(id, user.user_id, {
        project_id: body.project_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Project schedule deleted (moved to trash)',
      });
    }
  } catch (error) {
    console.error('Error deleting project schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete project schedule' },
      { status: 500 }
    );
  }
}
