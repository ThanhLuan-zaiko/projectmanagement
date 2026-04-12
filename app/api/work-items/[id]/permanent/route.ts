// API Route: /api/work-items/[id]/permanent
// DELETE - Permanently delete a work item from database

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

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

    // Hard delete - permanently remove from database
    await workItemRepository.delete(id, { params: [workItem.project_id] });

    return NextResponse.json({
      success: true,
      message: 'Work item permanently deleted',
    });
  } catch (error) {
    console.error('Error permanently deleting work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete work item' },
      { status: 500 }
    );
  }
}
