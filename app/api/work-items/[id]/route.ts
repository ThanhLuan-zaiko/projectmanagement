// API Route: /api/work-items/[id]
// GET - Get a specific work item
// PUT - Update a work item (full update)
// DELETE - Delete a work item

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/work-items/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const workItem = await workItemRepository.findById(id);

    if (!workItem) {
      return NextResponse.json(
        { success: false, error: 'Work item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workItem,
    });
  } catch (error) {
    console.error('Error fetching work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work item' },
      { status: 500 }
    );
  }
}

// PUT /api/work-items/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const workItem = await workItemRepository.findById(id);
    if (!workItem) {
      return NextResponse.json(
        { success: false, error: 'Work item not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    // Must include project_id for composite primary key
    updateData.project_id = workItem.project_id;

    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.work_type !== undefined) updateData.work_type = body.work_type;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    
    // Handle UUID fields: convert empty strings/null to null to avoid ScyllaDB errors
    if (body.assigned_to !== undefined) {
      if (body.assigned_to === null || String(body.assigned_to).trim() === '') {
        updateData.assigned_to = null;
      } else {
        updateData.assigned_to = String(body.assigned_to).trim();
      }
    }
    if (body.created_by !== undefined) {
      if (body.created_by === null || String(body.created_by).trim() === '') {
        updateData.created_by = null;
      } else {
        updateData.created_by = String(body.created_by).trim();
      }
    }
    if (body.parent_work_item_id !== undefined) {
      if (body.parent_work_item_id === null || String(body.parent_work_item_id).trim() === '') {
        updateData.parent_work_item_id = null;
      } else {
        updateData.parent_work_item_id = String(body.parent_work_item_id).trim();
      }
    }

    if (body.due_date !== undefined) updateData.due_date = body.due_date;
    if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours;
    if (body.actual_hours !== undefined) updateData.actual_hours = body.actual_hours;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;

    const updatedWorkItem = await workItemRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedWorkItem,
      message: 'Work item updated successfully',
    });
  } catch (error) {
    console.error('Error updating work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update work item' },
      { status: 500 }
    );
  }
}

// DELETE /api/work-items/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const workItem = await workItemRepository.findById(id);

    if (!workItem) {
      return NextResponse.json(
        { success: false, error: 'Work item not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting status to cancelled
    await workItemRepository.softDelete(id, workItem.project_id);

    return NextResponse.json({
      success: true,
      message: 'Work item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete work item' },
      { status: 500 }
    );
  }
}
