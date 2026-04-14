// API Route: /api/work-schedules/[id]
// GET - Get a specific work schedule
// PUT - Update a work schedule
// DELETE - Delete a work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/work-schedules/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const schedule = await workScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Work schedule not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    console.error('Error fetching work schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch work schedule' }, { status: 500 });
  }
}

// PUT /api/work-schedules/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!body.project_id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    // Validate date range if dates are provided
    if (body.planned_start_date && body.planned_end_date) {
      const startDate = new Date(body.planned_start_date);
      const endDate = new Date(body.planned_end_date);
      if (endDate < startDate) {
        return NextResponse.json({ success: false, error: 'End date must be after start date' }, { status: 400 });
      }
    }

    const updateData: Record<string, unknown> = { project_id: body.project_id };

    if (body.work_item_id !== undefined) updateData.work_item_id = body.work_item_id;
    if (body.schedule_id !== undefined) updateData.schedule_id = body.schedule_id || null;
    if (body.planned_start_date !== undefined) updateData.planned_start_date = new Date(body.planned_start_date);
    if (body.planned_end_date !== undefined) updateData.planned_end_date = new Date(body.planned_end_date);
    if (body.actual_start_date !== undefined) updateData.actual_start_date = body.actual_start_date ? new Date(body.actual_start_date) : null;
    if (body.actual_end_date !== undefined) updateData.actual_end_date = body.actual_end_date ? new Date(body.actual_end_date) : null;
    if (body.planned_hours !== undefined) updateData.planned_hours = body.planned_hours;
    if (body.actual_hours !== undefined) updateData.actual_hours = body.actual_hours;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.completion_percentage !== undefined) updateData.completion_percentage = body.completion_percentage;
    if (body.is_critical_path !== undefined) updateData.is_critical_path = body.is_critical_path;
    if (body.dependencies !== undefined) updateData.dependencies = body.dependencies;

    const updatedSchedule = await workScheduleRepository.update(id, updateData);

    return NextResponse.json({ success: true, data: updatedSchedule, message: 'Work schedule updated successfully' });
  } catch (error) {
    console.error('Error updating work schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to update work schedule' }, { status: 500 });
  }
}

// DELETE /api/work-schedules/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    const body = await request.json();

    if (!body.project_id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    if (permanent) {
      await workScheduleRepository.hardDelete(id, { project_id: body.project_id });
      return NextResponse.json({ success: true, message: 'Work schedule permanently deleted' });
    } else {
      await workScheduleRepository.softDelete(id, user.user_id, { project_id: body.project_id });
      return NextResponse.json({ success: true, message: 'Work schedule deleted (moved to trash)' });
    }
  } catch (error) {
    console.error('Error deleting work schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete work schedule' }, { status: 500 });
  }
}
