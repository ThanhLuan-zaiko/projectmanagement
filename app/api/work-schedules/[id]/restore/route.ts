// API Route: /api/work-schedules/[id]/restore
// POST - Restore a soft-deleted work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// POST /api/work-schedules/[id]/restore
export async function POST(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (!body.project_id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const schedule = await workScheduleRepository.findById(id, { params: [body.project_id] });

    if (!schedule) {
      return NextResponse.json({ success: false, error: 'Work schedule not found' }, { status: 404 });
    }

    if (!schedule.is_deleted) {
      return NextResponse.json({ success: false, error: 'Work schedule is not deleted' }, { status: 400 });
    }

    await workScheduleRepository.restore(id, { project_id: body.project_id });

    return NextResponse.json({ success: true, message: 'Work schedule restored successfully' });
  } catch (error) {
    console.error('Error restoring work schedule:', error);
    return NextResponse.json({ success: false, error: 'Failed to restore work schedule' }, { status: 500 });
  }
}
