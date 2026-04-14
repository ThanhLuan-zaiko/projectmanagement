// API Route: /api/project-schedules
// GET - Fetch project schedules with pagination and filtering
// POST - Create a new project schedule

import { NextRequest, NextResponse } from 'next/server';
import { projectScheduleRepository } from '@/lib/project-schedule-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';

// GET /api/project-schedules?project_id=&schedule_type=&status=&page=&limit=
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
    const projectId = searchParams.get('project_id') || '';
    const scheduleType = searchParams.get('schedule_type') || 'all';
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
      if (projectId) {
        schedules = await projectScheduleRepository.findDeleted(projectId);
      } else {
        return NextResponse.json({
          success: false,
          error: 'Project ID is required when viewing trash',
        }, { status: 400 });
      }
    } else if (projectId) {
      schedules = await projectScheduleRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    } else {
      // If no filters, return empty
      return NextResponse.json({
        success: true,
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
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
            db.execute('SELECT schedule_id, schedule_name FROM project_schedules WHERE schedule_id = ?', { params: [parentScheduleId] })
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
        scheduleType,
        status,
      },
    });
  } catch (error) {
    console.error('Error fetching project schedules:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch project schedules' },
      { status: 500 }
    );
  }
}

// POST /api/project-schedules
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

    if (!body.schedule_name) {
      return NextResponse.json(
        { success: false, error: 'Schedule name is required' },
        { status: 400 }
      );
    }

    if (!body.schedule_type) {
      return NextResponse.json(
        { success: false, error: 'Schedule type is required' },
        { status: 400 }
      );
    }

    if (!body.start_date || !body.end_date) {
      return NextResponse.json(
        { success: false, error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    // Validate date range
    const startDate = new Date(body.start_date);
    const endDate = new Date(body.end_date);
    if (endDate < startDate) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const scheduleData = {
      project_id: body.project_id,
      schedule_name: body.schedule_name,
      schedule_type: body.schedule_type,
      start_date: startDate,
      end_date: endDate,
      status: body.status || 'planned',
      progress_percentage: body.progress_percentage || 0,
      parent_schedule_id: body.parent_schedule_id || null,
      created_by: user.user_id,
    };

    const schedule = await projectScheduleRepository.create(scheduleData);

    return NextResponse.json({
      success: true,
      data: schedule,
      message: 'Project schedule created successfully',
    });
  } catch (error) {
    console.error('Error creating project schedule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project schedule' },
      { status: 500 }
    );
  }
}
