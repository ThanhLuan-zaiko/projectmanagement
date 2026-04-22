// API Route: /api/cost-estimates/[id]
// GET - Get a specific cost estimate
// PUT - Update a cost estimate
// DELETE - Delete a cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateCostEstimatePayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/cost-estimates/[id]
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

    if (!projectId || !workItemId) {
      return errorResponse(400, 'Project ID and Work Item ID are required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    const estimate = await costEstimateRepository.findById(id, { params: [projectId, workItemId] });

    if (!estimate) {
      return errorResponse(404, 'Cost estimate not found');
    }

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch cost estimate');
  }
}

// PUT /api/cost-estimates/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
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

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: projectId,
      work_item_id: workItemId,
    };

    if (sanitizedBody.estimate_type !== undefined) updateData.estimate_type = sanitizedBody.estimate_type;
    if (sanitizedBody.estimated_cost !== undefined) updateData.estimated_cost = sanitizedBody.estimated_cost;
    if (sanitizedBody.currency !== undefined) updateData.currency = sanitizedBody.currency;
    if (sanitizedBody.hourly_rate !== undefined) updateData.hourly_rate = sanitizedBody.hourly_rate;
    if (sanitizedBody.hours !== undefined) updateData.hours = sanitizedBody.hours;
    if (sanitizedBody.quantity !== undefined) updateData.quantity = sanitizedBody.quantity;
    if (sanitizedBody.unit_cost !== undefined) updateData.unit_cost = sanitizedBody.unit_cost;
    if (sanitizedBody.notes !== undefined) updateData.notes = sanitizedBody.notes;
    if (sanitizedBody.status !== undefined) updateData.status = sanitizedBody.status;

    // Recalculate estimated_cost if type and rates changed
    if (sanitizedBody.estimate_type === 'labor' && sanitizedBody.hourly_rate && sanitizedBody.hours) {
      updateData.estimated_cost = Number(sanitizedBody.hourly_rate) * Number(sanitizedBody.hours);
    } else if (sanitizedBody.estimate_type === 'material' && sanitizedBody.quantity && sanitizedBody.unit_cost) {
      updateData.estimated_cost = Number(sanitizedBody.quantity) * Number(sanitizedBody.unit_cost);
    }

    const updatedEstimate = await costEstimateRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedEstimate,
      message: 'Cost estimate updated successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update cost estimate');
  }
}

// DELETE /api/cost-estimates/[id]
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

    if (permanent) {
      // Hard delete - permanently remove
      await costEstimateRepository.hardDelete(id, {
        project_id: projectId,
        work_item_id: workItemId,
      });

      return NextResponse.json({
        success: true,
        message: 'Cost estimate permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await costEstimateRepository.softDelete(id, user.user_id, {
        project_id: projectId,
        work_item_id: workItemId,
      });

      return NextResponse.json({
        success: true,
        message: 'Cost estimate deleted (moved to trash)',
      });
    }
  } catch (error) {
    return handleRouteError(error, 'Failed to delete cost estimate');
  }
}
