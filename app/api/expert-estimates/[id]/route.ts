// API Route: /api/expert-estimates/[id]
// GET - Get a specific expert estimate
// PUT - Update an expert estimate
// DELETE - Delete an expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateExpertEstimatePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/expert-estimates/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const workItemId = searchParams.get('work_item_id');
    const expertId = searchParams.get('expert_id');

    if (!projectId || !workItemId || !expertId) {
      return errorResponse(400, 'Project ID, Work Item ID, and Expert ID are required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    const estimate = await expertEstimateRepository.findById(id, { params: [projectId, workItemId, expertId] });

    if (!estimate) {
      return errorResponse(404, 'Expert estimate not found');
    }

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch expert estimate');
  }
}

// PUT /api/expert-estimates/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
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

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: projectId,
      work_item_id: workItemId,
      expert_id: expertId,
    };

    if (sanitizedBody.estimated_hours !== undefined) updateData.estimated_hours = sanitizedBody.estimated_hours;
    if (sanitizedBody.confidence_level !== undefined) updateData.confidence_level = sanitizedBody.confidence_level;
    if (sanitizedBody.estimation_method !== undefined) updateData.estimation_method = sanitizedBody.estimation_method;
    if (sanitizedBody.optimistic_hours !== undefined) updateData.optimistic_hours = sanitizedBody.optimistic_hours;
    if (sanitizedBody.most_likely_hours !== undefined) updateData.most_likely_hours = sanitizedBody.most_likely_hours;
    if (sanitizedBody.pessimistic_hours !== undefined) updateData.pessimistic_hours = sanitizedBody.pessimistic_hours;
    if (sanitizedBody.notes !== undefined) updateData.notes = sanitizedBody.notes;

    // Recalculate three-point estimate if method changed
    if (
      sanitizedBody.estimation_method === 'three_point' &&
      sanitizedBody.optimistic_hours &&
      sanitizedBody.most_likely_hours &&
      sanitizedBody.pessimistic_hours
    ) {
      updateData.estimated_hours = expertEstimateRepository.calculateThreePointEstimate(
        Number(sanitizedBody.optimistic_hours),
        Number(sanitizedBody.most_likely_hours),
        Number(sanitizedBody.pessimistic_hours)
      );
    }

    const updatedEstimate = await expertEstimateRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedEstimate,
      message: 'Expert estimate updated successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update expert estimate');
  }
}

// DELETE /api/expert-estimates/[id]
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

    if (permanent) {
      // Hard delete - permanently remove
      await expertEstimateRepository.hardDelete(id, {
        project_id: projectId,
        work_item_id: workItemId,
        expert_id: expertId,
      });

      return NextResponse.json({
        success: true,
        message: 'Expert estimate permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await expertEstimateRepository.softDelete(id, user.user_id, {
        project_id: projectId,
        work_item_id: workItemId,
        expert_id: expertId,
      });

      return NextResponse.json({
        success: true,
        message: 'Expert estimate deleted (moved to trash)',
      });
    }
  } catch (error) {
    return handleRouteError(error, 'Failed to delete expert estimate');
  }
}
