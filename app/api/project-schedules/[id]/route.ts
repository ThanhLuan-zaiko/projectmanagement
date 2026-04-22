// API Route: /api/project-schedules/[id]
// GET - Get a specific project schedule
// PUT - Update a project schedule
// DELETE - Delete a project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateProjectSchedulePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/project-schedules/[id]
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

    const schedule = await projectScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return errorResponse(404, 'Project schedule not found');
    }

    return NextResponse.json({
      success: true,
      data: schedule,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch project schedule');
  }
}

// PUT /api/project-schedules/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateProjectSchedulePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const schedule = await projectScheduleRepository.findById(id, { params: [projectId] });
    if (!schedule) {
      return errorResponse(404, 'Project schedule not found');
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: projectId,
    };

    if (sanitizedBody.schedule_name !== undefined) updateData.schedule_name = sanitizedBody.schedule_name;
    if (sanitizedBody.schedule_type !== undefined) updateData.schedule_type = sanitizedBody.schedule_type;
    if (sanitizedBody.start_date !== undefined) updateData.start_date = sanitizedBody.start_date;
    if (sanitizedBody.end_date !== undefined) updateData.end_date = sanitizedBody.end_date;
    if (sanitizedBody.status !== undefined) updateData.status = sanitizedBody.status;
    if (sanitizedBody.progress_percentage !== undefined) updateData.progress_percentage = sanitizedBody.progress_percentage;
    if (sanitizedBody.parent_schedule_id !== undefined) updateData.parent_schedule_id = sanitizedBody.parent_schedule_id;

    const updatedSchedule = await projectScheduleRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedSchedule,
      message: 'Project schedule updated successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update project schedule');
  }
}

// DELETE /api/project-schedules/[id]
// Soft delete by default, use ?permanent=true for hard delete
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
    const validation = validateProjectSchedulePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const schedule = await projectScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return errorResponse(404, 'Project schedule not found');
    }

    if (permanent) {
      // Hard delete - permanently remove
      await projectScheduleRepository.hardDelete(id, {
        project_id: projectId,
      });

      return NextResponse.json({
        success: true,
        message: 'Project schedule permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await projectScheduleRepository.softDelete(id, user.user_id, {
        project_id: projectId,
      });

      return NextResponse.json({
        success: true,
        message: 'Project schedule deleted (moved to trash)',
      });
    }
  } catch (error) {
    return handleRouteError(error, 'Failed to delete project schedule');
  }
}
