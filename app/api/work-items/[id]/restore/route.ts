// API Route: /api/work-items/[id]/restore
// POST - Restore a soft-deleted work item (change status from cancelled to todo)

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkItemPayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateWorkItemPayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted task fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const workItem = await workItemRepository.findById(id, { params: [projectId] });

    if (!workItem) {
      return errorResponse(404, 'Work item not found');
    }

    if (workItem.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Work item is not deleted' },
        { status: 400 }
      );
    }

    // Restore by changing status from cancelled to todo
    const restoredWorkItem = await workItemRepository.update(id, {
      project_id: projectId,
      status: 'todo',
    });

    return NextResponse.json({
      success: true,
      data: restoredWorkItem,
      message: 'Work item restored successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore work item');
  }
}
