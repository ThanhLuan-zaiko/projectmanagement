// API Route: /api/expert-estimates/[id]
// GET - Get a specific expert estimate
// PUT - Update an expert estimate
// DELETE - Delete an expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/expert-estimates/[id]
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
    const expertId = searchParams.get('expert_id');

    if (!projectId || !workItemId || !expertId) {
      return NextResponse.json(
        { success: false, error: 'Project ID, Work Item ID, and Expert ID are required' },
        { status: 400 }
      );
    }

    const estimate = await expertEstimateRepository.findById(id, { params: [projectId, workItemId, expertId] });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Expert estimate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    console.error('Error fetching expert estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert estimate' },
      { status: 500 }
    );
  }
}

// PUT /api/expert-estimates/[id]
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
    if (!body.project_id || !body.work_item_id || !body.expert_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID, Work Item ID, and Expert ID are required' },
        { status: 400 }
      );
    }

    const estimate = await expertEstimateRepository.findById(id, { params: [body.project_id, body.work_item_id, body.expert_id] });
    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Expert estimate not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
      expert_id: body.expert_id,
    };

    if (body.estimated_hours !== undefined) updateData.estimated_hours = body.estimated_hours;
    if (body.confidence_level !== undefined) updateData.confidence_level = body.confidence_level;
    if (body.estimation_method !== undefined) updateData.estimation_method = body.estimation_method;
    if (body.optimistic_hours !== undefined) updateData.optimistic_hours = body.optimistic_hours;
    if (body.most_likely_hours !== undefined) updateData.most_likely_hours = body.most_likely_hours;
    if (body.pessimistic_hours !== undefined) updateData.pessimistic_hours = body.pessimistic_hours;
    if (body.notes !== undefined) updateData.notes = body.notes;

    // Recalculate three-point estimate if method changed
    if (body.estimation_method === 'three_point' && body.optimistic_hours && body.most_likely_hours && body.pessimistic_hours) {
      updateData.estimated_hours = expertEstimateRepository.calculateThreePointEstimate(
        body.optimistic_hours,
        body.most_likely_hours,
        body.pessimistic_hours
      );
    }

    const updatedEstimate = await expertEstimateRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedEstimate,
      message: 'Expert estimate updated successfully',
    });
  } catch (error) {
    console.error('Error updating expert estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expert estimate' },
      { status: 500 }
    );
  }
}

// DELETE /api/expert-estimates/[id]
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

    if (!body.project_id || !body.work_item_id || !body.expert_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID, Work Item ID, and Expert ID are required' },
        { status: 400 }
      );
    }

    const estimate = await expertEstimateRepository.findById(id, { params: [body.project_id, body.work_item_id, body.expert_id] });

    if (!estimate) {
      return NextResponse.json(
        { success: false, error: 'Expert estimate not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // Hard delete - permanently remove
      await expertEstimateRepository.hardDelete(id, {
        project_id: body.project_id,
        work_item_id: body.work_item_id,
        expert_id: body.expert_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Expert estimate permanently deleted',
      });
    } else {
      // Soft delete - mark as deleted
      await expertEstimateRepository.softDelete(id, user.user_id, {
        project_id: body.project_id,
        work_item_id: body.work_item_id,
        expert_id: body.expert_id,
      });

      return NextResponse.json({
        success: true,
        message: 'Expert estimate deleted (moved to trash)',
      });
    }
  } catch (error) {
    console.error('Error deleting expert estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete expert estimate' },
      { status: 500 }
    );
  }
}
