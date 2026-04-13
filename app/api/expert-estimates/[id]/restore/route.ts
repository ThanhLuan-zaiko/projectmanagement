// API Route: /api/expert-estimates/[id]/restore
// POST - Restore a soft-deleted expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/expert-estimates/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
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

    if (!estimate.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Expert estimate is not deleted' },
        { status: 400 }
      );
    }

    await expertEstimateRepository.restore(id, {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
      expert_id: body.expert_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Expert estimate restored successfully',
    });
  } catch (error) {
    console.error('Error restoring expert estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore expert estimate' },
      { status: 500 }
    );
  }
}
