// API Route: /api/expert-estimates/[id]/restore
// POST - Restore a soft-deleted expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateExpertEstimatePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/expert-estimates/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateExpertEstimatePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted expert estimate fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    const workItemId = String(sanitizedBody.work_item_id);
    const expertId = String(sanitizedBody.expert_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const estimate = await expertEstimateRepository.findById(id, { params: [projectId, workItemId, expertId] });

    if (!estimate) {
      return errorResponse(404, 'Expert estimate not found');
    }

    if (!estimate.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Expert estimate is not deleted' },
        { status: 400 }
      );
    }

    await expertEstimateRepository.restore(id, {
      project_id: projectId,
      work_item_id: workItemId,
      expert_id: expertId,
    });

    return NextResponse.json({
      success: true,
      message: 'Expert estimate restored successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore expert estimate');
  }
}
