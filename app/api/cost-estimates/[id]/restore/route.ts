// API Route: /api/cost-estimates/[id]/restore
// POST - Restore a soft-deleted cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/cost-estimates/[id]/restore
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

    if (!estimate.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Cost estimate is not deleted' },
        { status: 400 }
      );
    }

    await costEstimateRepository.restore(id, {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Cost estimate restored successfully',
    });
  } catch (error) {
    console.error('Error restoring cost estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore cost estimate' },
      { status: 500 }
    );
  }
}
