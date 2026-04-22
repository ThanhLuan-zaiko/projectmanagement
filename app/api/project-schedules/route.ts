// API Route: /api/project-schedules
// GET - Fetch project schedules with pagination and filtering
// POST - Create a new project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository, type ProjectSchedule } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateProjectSchedulePayload } from '@/lib/dashboard-validation';

type ProjectScheduleListItem = ProjectSchedule & {
  parent_schedule_name?: string | null;
  created_by_name?: string | null;
};

// GET /api/project-schedules?project_id=&schedule_type=&status=&page=&limit=
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
    const scheduleType = searchParams.get('schedule_type') || 'all';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || 'created_at';
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
    let schedules: ProjectScheduleListItem[] = [];

    if (deletedOnly) {
      // Only fetch deleted items (trash)
      schedules = await projectScheduleRepository.findDeleted(projectId);
    } else {
      schedules = await projectScheduleRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (scheduleType !== 'all') {
      schedules = schedules.filter((sch) => sch.schedule_type === scheduleType);
    }
    if (status !== 'all') {
      schedules = schedules.filter((sch) => sch.status === status);
    }

    // Enrich with parent schedule names and creator names
    if (schedules.length > 0) {
      // Fetch parent schedule names
      const parentScheduleIds = [...new Set(schedules
        .filter((sch) => sch.parent_schedule_id)
        .map((sch) => sch.parent_schedule_id)
      )];

      if (parentScheduleIds.length > 0) {
        try {
          const parentPromises = parentScheduleIds.map((parentScheduleId) =>
            db.execute('SELECT schedule_id, schedule_name FROM project_schedules WHERE project_id = ? AND schedule_id = ?', {
              params: [projectId, parentScheduleId],
            })
          );
          const parentResults = await Promise.all(parentPromises);

          const parentMap = new Map();
          parentResults.forEach((result) => {
            if (result.rows && result.rows.length > 0) {
              const scheduleIdStr = String(result.rows[0].schedule_id);
              parentMap.set(scheduleIdStr, result.rows[0].schedule_name);
            }
          });

          schedules = schedules.map((sch) => ({
            ...sch,
            parent_schedule_name: sch.parent_schedule_id ? (parentMap.get(String(sch.parent_schedule_id)) || null) : null,
          }));
        } catch (err) {
          console.error('Failed to fetch parent schedule names:', err);
        }
      }

      // Fetch creator names
      const creatorIds = [...new Set(schedules
        .filter((sch) => sch.created_by)
        .map((sch) => sch.created_by)
      )];

      if (creatorIds.length > 0) {
        try {
          const creatorPromises = creatorIds.map((creatorId) =>
            db.execute('SELECT user_id, full_name FROM users WHERE user_id = ?', { params: [creatorId] })
          );
          const creatorResults = await Promise.all(creatorPromises);

          const creatorMap = new Map();
          creatorResults.forEach((result) => {
            if (result.rows && result.rows.length > 0) {
              const userIdStr = String(result.rows[0].user_id);
              creatorMap.set(userIdStr, result.rows[0].full_name);
            }
          });

          schedules = schedules.map((sch) => ({
            ...sch,
            created_by_name: sch.created_by ? (creatorMap.get(String(sch.created_by)) || null) : null,
          }));
        } catch (err) {
          console.error('Failed to fetch creator names:', err);
        }
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      schedules = schedules.filter((sch) =>
        [
          sch.schedule_name,
          sch.schedule_type,
          sch.status,
          sch.parent_schedule_name,
          sch.created_by_name,
        ].some((value) => String(value || '').toLowerCase().includes(searchLower))
      );
    }

    schedules = schedules.sort((a, b) => {
      let aValue: number | string = '';
      let bValue: number | string = '';

      switch (sortBy) {
        case 'start_date':
          aValue = new Date(a.start_date || 0).getTime();
          bValue = new Date(b.start_date || 0).getTime();
          break;
        case 'end_date':
          aValue = new Date(a.end_date || 0).getTime();
          bValue = new Date(b.end_date || 0).getTime();
          break;
        case 'progress_percentage':
          aValue = Number(a.progress_percentage || 0);
          bValue = Number(b.progress_percentage || 0);
          break;
        case 'created_at':
        default:
          aValue = new Date(a.created_at || 0).getTime();
          bValue = new Date(b.created_at || 0).getTime();
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
        scheduleType,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch project schedules');
  }
}

// POST /api/project-schedules
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateProjectSchedulePayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted schedule fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    if (!(sanitizedBody.start_date instanceof Date) || !(sanitizedBody.end_date instanceof Date)) {
      return errorResponse(400, 'Start date and end date are required');
    }

    const scheduleData: Partial<ProjectSchedule> = {
      project_id: projectId,
      schedule_name: String(sanitizedBody.schedule_name),
      schedule_type: sanitizedBody.schedule_type ?? 'phase',
      start_date: sanitizedBody.start_date,
      end_date: sanitizedBody.end_date,
      status: sanitizedBody.status ?? 'planned',
      progress_percentage: sanitizedBody.progress_percentage ?? 0,
      parent_schedule_id: sanitizedBody.parent_schedule_id ?? null,
      created_by: user.user_id,
    };

    const schedule = await projectScheduleRepository.create(scheduleData);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Project schedule created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create project schedule');
  }
}
