// API Route: /api/work-schedules
// GET - Fetch work schedules with pagination and filtering
// POST - Create a new work schedule

import { NextRequest, NextResponse } from 'next/server';
import { workScheduleRepository, type WorkItemSchedule } from '@/lib/work-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkSchedulePayload } from '@/lib/dashboard-validation';

type WorkScheduleListItem = WorkItemSchedule & {
  work_item_title?: string | null;
  schedule_name?: string | null;
  scheduled_by_name?: string | null;
};

// GET /api/work-schedules?project_id=&status=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);

    // Filters
    const projectId = searchParams.get('project_id');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || 'scheduled_at';
    const sortOrder = searchParams.get('sort_order') === 'asc' ? 'asc' : 'desc';
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const deletedOnly = searchParams.get('deleted_only') === 'true';

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    // Pagination
    const page = parseIntegerParam(searchParams.get('page'), 1);
    const limit = parseIntegerParam(searchParams.get('limit'), 10);
    const offset = (page - 1) * limit;

    // Fetch schedules
    let schedules: WorkScheduleListItem[] = [];

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
          db.execute('SELECT work_item_id, title FROM work_items WHERE project_id = ? AND work_item_id = ?', {
            params: [projectId, workItemId],
          })
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

      const scheduleIds = [...new Set(schedules
        .filter((sch) => sch.schedule_id)
        .map((sch) => sch.schedule_id)
      )];

      if (scheduleIds.length > 0) {
        try {
          const schedulePromises = scheduleIds.map((scheduleId) =>
            db.execute('SELECT schedule_id, schedule_name FROM project_schedules WHERE project_id = ? AND schedule_id = ?', {
              params: [projectId, scheduleId],
            })
          );
          const scheduleResults = await Promise.all(schedulePromises);

          const scheduleMap = new Map();
          scheduleResults.forEach((result) => {
            if (result.rows && result.rows.length > 0) {
              const scheduleIdStr = String(result.rows[0].schedule_id);
              scheduleMap.set(scheduleIdStr, result.rows[0].schedule_name);
            }
          });

          schedules = schedules.map((sch) => ({
            ...sch,
            schedule_name: sch.schedule_id ? (scheduleMap.get(String(sch.schedule_id)) || null) : null,
          }));
        } catch (err) {
          console.error('Failed to fetch schedule names:', err);
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

    if (search) {
      const searchLower = search.toLowerCase();
      schedules = schedules.filter((sch) =>
        [
          sch.status,
          sch.work_item_title,
          sch.schedule_name,
          sch.scheduled_by_name,
        ].some((value) => String(value || '').toLowerCase().includes(searchLower))
      );
    }

    schedules = schedules.sort((a, b) => {
      let aValue: number | string = '';
      let bValue: number | string = '';

      switch (sortBy) {
        case 'planned_start_date':
          aValue = new Date(a.planned_start_date || 0).getTime();
          bValue = new Date(b.planned_start_date || 0).getTime();
          break;
        case 'planned_end_date':
          aValue = new Date(a.planned_end_date || 0).getTime();
          bValue = new Date(b.planned_end_date || 0).getTime();
          break;
        case 'completion_percentage':
          aValue = Number(a.completion_percentage || 0);
          bValue = Number(b.completion_percentage || 0);
          break;
        case 'scheduled_at':
        default:
          aValue = new Date(a.scheduled_at || 0).getTime();
          bValue = new Date(b.scheduled_at || 0).getTime();
          break;
      }

      if (aValue === bValue) {
        return 0;
      }

      return sortOrder === 'asc'
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });

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
        search,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch work schedules');
  }
}

// POST /api/work-schedules
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateWorkSchedulePayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted work schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    if (
      !sanitizedBody.work_item_id ||
      !(sanitizedBody.planned_start_date instanceof Date) ||
      !(sanitizedBody.planned_end_date instanceof Date)
    ) {
      return errorResponse(400, 'Work item, planned start date, and planned end date are required');
    }

    const scheduleData: Partial<WorkItemSchedule> = {
      project_id: projectId,
      work_item_id: sanitizedBody.work_item_id,
      schedule_id: sanitizedBody.schedule_id ?? null,
      planned_start_date: sanitizedBody.planned_start_date,
      planned_end_date: sanitizedBody.planned_end_date,
      actual_start_date: sanitizedBody.actual_start_date ?? null,
      actual_end_date: sanitizedBody.actual_end_date ?? null,
      planned_hours: sanitizedBody.planned_hours ?? null,
      actual_hours: sanitizedBody.actual_hours ?? null,
      status: sanitizedBody.status ?? 'not_started',
      completion_percentage: sanitizedBody.completion_percentage ?? 0,
      is_critical_path: sanitizedBody.is_critical_path ?? false,
      dependencies: sanitizedBody.dependencies ?? [],
      scheduled_by: user.user_id,
    };

    const schedule = await workScheduleRepository.create(scheduleData);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Work schedule created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create work schedule');
  }
}
