// API Route: /api/work-schedules/[id]/restore
// POST - Restore a soft-deleted work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkSchedulePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/work-schedules/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
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

    const schedule = await workScheduleRepository.findById(id, { params: [projectId] });

    if (!schedule) {
      return errorResponse(404, 'Work schedule not found');
    }

    if (!schedule.is_deleted) {
      return NextResponse.json({ success: false, error: 'Work schedule is not deleted' }, { status: 400 });
    }

    await workScheduleRepository.restore(id, { project_id: projectId });

    return NextResponse.json({ success: true, message: 'Work schedule restored successfully' });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore work schedule');
  }
}
