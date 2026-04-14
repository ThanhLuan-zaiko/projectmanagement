// API Route: /api/cost-estimates/[id]
// GET - Get a specific cost estimate
// PUT - Update a cost estimate
// DELETE - Delete a cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/cost-estimates/[id]
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
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');
    const workItemId = searchParams.get('work_item_id');

    if (!projectId || !workItemId) {
      return NextResponse.json(
        { success: false, error: 'Project ID and Work Item ID are required' },
        { status: 400 }
      );
    }

    const estimate = await costEstimateRepository.findById(id, { params: [projectId, workItemId] });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Cost estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error('Error fetching cost estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost estimate' },
      { status: 500 }
    );
  }
}

// PUT /api/cost-estimates/[id]
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

    // Validate required fields for composite key
    if (!body.project_id || !body.work_item_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID and Work Item ID are required' },
        { status: 400 }
      );
    }

    const estimate = await costEstimateRepository.findById(id, { params: [body.project_id, body.work_item_id] });
    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Cost estimate not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
    };

    if (body.estimate_type !== undefined) updateData.estimate_type = body.estimate_type;
    if (body.estimated_cost !== undefined) updateData.estimated_cost = body.estimated_cost;
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.hourly_rate !== undefined) updateData.hourly_rate = body.hourly_rate;
    if (body.hours !== undefined) updateData.hours = body.hours;
    if (body.quantity !== undefined) updateData.quantity = body.quantity;
    if (body.unit_cost !== undefined) updateData.unit_cost = body.unit_cost;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.status !== undefined) updateData.status = body.status;

    // Recalculate estimated_cost if type and rates changed
    if (body.estimate_type === 'labor' && body.hourly_rate && body.hours) {
      updateData.estimated_cost = body.hourly_rate * body.hours;
    } else if (body.estimate_type === 'material' && body.quantity && body.unit_cost) {
      updateData.estimated_cost = body.quantity * body.unit_cost;
    }

    const updatedEstimate = await costEstimateRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedEstimate,
      message: 'Cost estimate updated successfully',
    });
  } catch (error) {
    console.error('Error updating cost estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost estimate' },
      { status: 500 }
    );
  }
}

// DELETE /api/cost-estimates/[id]
// Soft delete by default, use ?permanent=true for hard delete
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
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const body = await request.json();

    if (!body.project_id || !body.work_item_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID and Work Item ID are required' },
        { status: 400 }
      );
    }

    const estimate = await costEstimateRepository.findById(id, { params: [body.project_id, body.work_item_id] });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Cost estimate not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Hard delete - permanently remove
      await costEstimateRepository.hardDelete(id, {
        project_id: body.project_id,
        work_item_id: body.work_item_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Cost estimate permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await costEstimateRepository.softDelete(id, user.user_id, {
        project_id: body.project_id,
        work_item_id: body.work_item_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Cost estimate deleted (moved to trash)',
      });
    }
  } catch (error) {
    console.error('Error deleting cost estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost estimate' },
      { status: 500 }
    );
  }
}
