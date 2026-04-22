// API Route: /api/work-schedules/[id]
// GET - Get a specific work schedule
// PUT - Update a work schedule
// DELETE - Delete a work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkSchedulePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/work-schedules/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    const schedule = await workScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return errorResponse(404, 'Work schedule not found');
    }

    return NextResponse.json({ success: true, data: schedule });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch work schedule');
  }
}

// PUT /api/work-schedules/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateWorkSchedulePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted work schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const updateData: Record<string, unknown> = { project_id: projectId };

    if (sanitizedBody.work_item_id !== undefined) updateData.work_item_id = sanitizedBody.work_item_id;
    if (sanitizedBody.schedule_id !== undefined) updateData.schedule_id = sanitizedBody.schedule_id;
    if (sanitizedBody.planned_start_date !== undefined) updateData.planned_start_date = sanitizedBody.planned_start_date;
    if (sanitizedBody.planned_end_date !== undefined) updateData.planned_end_date = sanitizedBody.planned_end_date;
    if (sanitizedBody.actual_start_date !== undefined) updateData.actual_start_date = sanitizedBody.actual_start_date;
    if (sanitizedBody.actual_end_date !== undefined) updateData.actual_end_date = sanitizedBody.actual_end_date;
    if (sanitizedBody.planned_hours !== undefined) updateData.planned_hours = sanitizedBody.planned_hours;
    if (sanitizedBody.actual_hours !== undefined) updateData.actual_hours = sanitizedBody.actual_hours;
    if (sanitizedBody.status !== undefined) updateData.status = sanitizedBody.status;
    if (sanitizedBody.completion_percentage !== undefined) updateData.completion_percentage = sanitizedBody.completion_percentage;
    if (sanitizedBody.is_critical_path !== undefined) updateData.is_critical_path = sanitizedBody.is_critical_path;
    if (sanitizedBody.dependencies !== undefined) updateData.dependencies = sanitizedBody.dependencies;

    const updatedSchedule = await workScheduleRepository.update(id, updateData);

    return NextResponse.json({ success: true, data: updatedSchedule, message: 'Work schedule updated successfully' });
  } catch (error) {
    return handleRouteError(error, 'Failed to update work schedule');
  }
}

// DELETE /api/work-schedules/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateWorkSchedulePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted work schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    if (permanent) {
      await workScheduleRepository.hardDelete(id, { project_id: projectId });
      return NextResponse.json({ success: true, message: 'Work schedule permanently deleted' });
    } else {
      await workScheduleRepository.softDelete(id, user.user_id, { project_id: projectId });
      return NextResponse.json({ success: true, message: 'Work schedule deleted (moved to trash)' });
    }
  } catch (error) {
    return handleRouteError(error, 'Failed to delete work schedule');
  }
}
