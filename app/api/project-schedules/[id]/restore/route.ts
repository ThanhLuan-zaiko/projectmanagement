// API Route: /api/project-schedules/[id]/restore
// POST - Restore a soft-deleted project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateProjectSchedulePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/project-schedules/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
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

    if (!schedule.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Project schedule is not deleted' },
        { status: 400 }
      );
    }

    await projectScheduleRepository.restore(id, {
      project_id: projectId,
    });

    return NextResponse.json({
      success: true,
      message: 'Project schedule restored successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore project schedule');
  }
}
