// API Route: /api/work-items/[id]/restore
// POST - Restore a soft-deleted work item (change status from cancelled to todo)

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

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
    const workItem = await workItemRepository.findById(id);

    if (!workItem) {
      return NextResponse.json(
        { success: false, error: 'Work item not found' },
        { status: 404 }
      );
    }

    if (workItem.status !== 'cancelled') {
      return NextResponse.json(
        { success: false, error: 'Work item is not deleted' },
        { status: 400 }
      );
    }

    // Restore by changing status from cancelled to todo
    const restoredWorkItem = await workItemRepository.update(id, {
      project_id: workItem.project_id,
      status: 'todo',
    });

    return NextResponse.json({
      success: true,
      data: restoredWorkItem,
      message: 'Work item restored successfully',
    });
  } catch (error) {
    console.error('Error restoring work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore work item' },
      { status: 500 }
    );
  }
}
