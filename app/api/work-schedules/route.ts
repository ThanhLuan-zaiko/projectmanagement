// API Route: /api/work-schedules
// GET - Fetch work schedules with pagination and filtering
// POST - Create a new work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';

// GET /api/work-schedules?project_id=&status=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Filters
    const projectId = searchParams.get('project_id') || '00000000-0000-0000-0000-000000000001';
    const status = searchParams.get('status') || 'all';
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const deletedOnly = searchParams.get('deleted_only') === 'true';

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch schedules
    let schedules: any[] = [];

    if (deletedOnly) {
      // Only fetch deleted items (trash)
      schedules = await workScheduleRepository.findDeleted(projectId);
    } else {
      schedules = await workScheduleRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (status !== 'all') {
      schedules = schedules.filter((sch) => sch.status === status);
    }

    // Enrich with work item titles and user names
    if (schedules.length > 0) {
      // Fetch work item titles
      const workItemIds = [...new Set(schedules.map((sch) => sch.work_item_id))];

      if (workItemIds.length > 0) {
        try {
          const workItemPromises = workItemIds.map((workItemId) =>
            db.execute('SELECT work_item_id, title FROM work_items WHERE work_item_id = ?', { params: [workItemId] })
          );
          const workItemResults = await Promise.all(workItemPromises);

          const workItemMap = new Map();
          workItemResults.forEach((result) => {
            if (result.rows && result.rows.length > 0) {
              const workItemIdStr = String(result.rows[0].work_item_id);
              workItemMap.set(workItemIdStr, result.rows[0].title);
            }
          });

          schedules = schedules.map((sch) => ({
            ...sch,
            work_item_title: workItemMap.get(String(sch.work_item_id)) || null,
          }));
        } catch (err) {
          console.error('Failed to fetch work item titles:', err);
        }
      }

      // Fetch scheduled_by names
      const scheduledByIds = [...new Set(schedules
        .filter((sch) => sch.scheduled_by)
        .map((sch) => sch.scheduled_by)
      )];

      if (scheduledByIds.length > 0) {
        try {
          const userPromises = scheduledByIds.map((userId) =>
            db.execute('SELECT user_id, full_name FROM users WHERE user_id = ?', { params: [userId] })
          );
          const userResults = await Promise.all(userPromises);

          const userMap = new Map();
          userResults.forEach((result) => {
            if (result.rows && result.rows.length > 0) {
              const userIdStr = String(result.rows[0].user_id);
              userMap.set(userIdStr, result.rows[0].full_name);
            }
          });

          schedules = schedules.map((sch) => ({
            ...sch,
            scheduled_by_name: sch.scheduled_by ? (userMap.get(String(sch.scheduled_by)) || null) : null,
          }));
        } catch (err) {
          console.error('Failed to fetch user names:', err);
        }
      }
    }

    // Calculate total
    const total = schedules.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedItems = schedules.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      filters: {
        projectId,
        status,
      },
    });
  } catch (error) {
    console.error('Error fetching work schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work schedules' },
      { status: 500 }
    );
  }
}

// POST /api/work-schedules
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!body.work_item_id) {
      return NextResponse.json(
        { success: false, error: 'Work item ID is required' },
        { status: 400 }
      );
    }

    if (!body.planned_start_date || !body.planned_end_date) {
      return NextResponse.json(
        { success: false, error: 'Planned start and end dates are required' },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(body.planned_start_date);
    const endDate = new Date(body.planned_end_date);
    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const scheduleData = {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
      schedule_id: body.schedule_id || null,
      planned_start_date: startDate,
      planned_end_date: endDate,
      actual_start_date: body.actual_start_date ? new Date(body.actual_start_date) : null,
      actual_end_date: body.actual_end_date ? new Date(body.actual_end_date) : null,
      planned_hours: body.planned_hours || null,
      actual_hours: body.actual_hours || null,
      status: body.status || 'not_started',
      completion_percentage: body.completion_percentage || 0,
      is_critical_path: body.is_critical_path || false,
      dependencies: body.dependencies || [],
      scheduled_by: user.user_id,
    };

    const schedule = await workScheduleRepository.create(scheduleData);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Work schedule created successfully',
    });
  } catch (error) {
    console.error('Error creating work schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create work schedule' },
      { status: 500 }
    );
  }
}
