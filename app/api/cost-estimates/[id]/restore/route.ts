// API Route: /api/cost-estimates/[id]/restore
// POST - Restore a soft-deleted cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateCostEstimatePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/cost-estimates/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateCostEstimatePayload(body, 'update');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted cost estimate fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    const workItemId = String(sanitizedBody.work_item_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const estimate = await costEstimateRepository.findById(id, { params: [projectId, workItemId] });

    if (!estimate) {
      return errorResponse(404, 'Cost estimate not found');
    }

    if (!estimate.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Cost estimate is not deleted' },
        { status: 400 }
      );
    }

    await costEstimateRepository.restore(id, {
      project_id: projectId,
      work_item_id: workItemId,
    });

    return NextResponse.json({
      success: true,
      message: 'Cost estimate restored successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore cost estimate');
  }
}
