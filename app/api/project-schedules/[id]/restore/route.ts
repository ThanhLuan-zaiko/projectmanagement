// API Route: /api/project-schedules/[id]/restore
// POST - Restore a soft-deleted project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/project-schedules/[id]/restore
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

    if (!body.project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    const schedule = await projectScheduleRepository.findById(id, { params: [body.project_id] });

    if (!schedule) {
      return NextResponse.json(
        { success: false, error: 'Project schedule not found' },
        { status: 404 }
      );
    }

    if (!schedule.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Project schedule is not deleted' },
        { status: 400 }
      );
    }

    await projectScheduleRepository.restore(id, {
      project_id: body.project_id,
    });

    return NextResponse.json({
      success: true,
      message: 'Project schedule restored successfully',
    });
  } catch (error) {
    console.error('Error restoring project schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore project schedule' },
      { status: 500 }
    );
  }
}
