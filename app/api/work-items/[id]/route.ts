// API Route: /api/work-items/[id]
// GET - Get a specific work item
// PUT - Update a work item (full update)
// DELETE - Delete a work item

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkItemPayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/work-items/[id]
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

    const workItem = await workItemRepository.findById(id, { params: [projectId] });

    if (!workItem) {
      return errorResponse(404, 'Work item not found');
    }

    return NextResponse.json({
      success: true,
      data: workItem,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch work item');
  }
}

// PUT /api/work-items/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
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

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Must include project_id for composite primary key
    updateData.project_id = workItem.project_id;

    if (sanitizedBody.title !== undefined) updateData.title = sanitizedBody.title;
    if (sanitizedBody.description !== undefined) updateData.description = sanitizedBody.description;
    if (sanitizedBody.work_type !== undefined) updateData.work_type = sanitizedBody.work_type;
    if (sanitizedBody.status !== undefined) updateData.status = sanitizedBody.status;
    if (sanitizedBody.priority !== undefined) updateData.priority = sanitizedBody.priority;
    if (sanitizedBody.assigned_to !== undefined) updateData.assigned_to = sanitizedBody.assigned_to;
    if (sanitizedBody.parent_work_item_id !== undefined) updateData.parent_work_item_id = sanitizedBody.parent_work_item_id;
    if (sanitizedBody.due_date !== undefined) updateData.due_date = sanitizedBody.due_date;
    if (sanitizedBody.estimated_hours !== undefined) updateData.estimated_hours = sanitizedBody.estimated_hours;
    if (sanitizedBody.actual_hours !== undefined) updateData.actual_hours = sanitizedBody.actual_hours;
    if (sanitizedBody.tags !== undefined) updateData.tags = sanitizedBody.tags;
    if (sanitizedBody.attachments !== undefined) updateData.attachments = sanitizedBody.attachments;

    const updatedWorkItem = await workItemRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedWorkItem,
      message: 'Work item updated successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update work item');
  }
}

// DELETE /api/work-items/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
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

    // Soft delete by setting status to cancelled
    await workItemRepository.softDelete(id, projectId);

    return NextResponse.json({
      success: true,
      message: 'Work item deleted successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to delete work item');
  }
}
