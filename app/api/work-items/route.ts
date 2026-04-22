// API Route: /api/work-items
// GET - Fetch work items with pagination and server-side filtering
// POST - Create a new work item

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository, type WorkItem } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateWorkItemPayload } from '@/lib/dashboard-validation';
import { generateUUIDv7 } from '@/utils/uuid';

// GET /api/work-items?project_id=&search=&status=&priority=&work_type=&page=&limit=&sort_by=&sort_order=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);

    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    // Filters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const workType = searchParams.get('work_type') || 'all';

    // Pagination
    const page = parseIntegerParam(searchParams.get('page'), 1);
    const limit = parseIntegerParam(searchParams.get('limit'), 10);
    const offset = (page - 1) * limit;

    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Fetch work items for the project
    let workItems = await workItemRepository.findByProjectId(projectId, { limit: 1000 });

    // Apply server-side filtering
    if (search) {
      workItems = workItems.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (status !== 'all') {
      workItems = workItems.filter((item) => item.status === status);
    }
    if (priority !== 'all') {
      workItems = workItems.filter((item) => item.priority === priority);
    }
    if (workType !== 'all') {
      workItems = workItems.filter((item) => item.work_type === workType);
    }

    // Apply sorting
    workItems = workItems.sort((a, b) => {
      const getSortValue = (item: typeof workItems[number]) => {
        switch (sortBy) {
          case 'updated_at':
            return new Date(item.updated_at || 0).getTime();
          case 'title':
            return String(item.title || '').toLowerCase();
          case 'priority':
            return String(item.priority || '').toLowerCase();
          case 'status':
            return String(item.status || '').toLowerCase();
          case 'due_date':
            return item.due_date ? new Date(item.due_date).getTime() : 0;
          case 'created_at':
          default:
            return new Date(item.created_at || 0).getTime();
        }
      };

      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Calculate total
    const total = workItems.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedItems = workItems.slice(offset, offset + limit);

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
        search,
        status,
        priority,
        workType,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch work items');
  }
}

// POST /api/work-items
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateWorkItemPayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted task fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    // Generate UUID for work item
    const workItemId = generateUUIDv7();

    const workItemData: Partial<WorkItem> = {
      work_item_id: workItemId,
      project_id: projectId,
      title: String(sanitizedBody.title),
      description: sanitizedBody.description || '',
      work_type: sanitizedBody.work_type ?? 'task',
      status: sanitizedBody.status ?? 'todo',
      priority: sanitizedBody.priority ?? 'medium',
      created_by: user.user_id,
      assigned_to: sanitizedBody.assigned_to ?? null,
      due_date: sanitizedBody.due_date ?? null,
      estimated_hours: sanitizedBody.estimated_hours ?? null,
      actual_hours: sanitizedBody.actual_hours ?? null,
      parent_work_item_id: sanitizedBody.parent_work_item_id ?? null,
      tags: sanitizedBody.tags ?? [],
      attachments: sanitizedBody.attachments ?? [],
    };

    const workItem = await workItemRepository.create(workItemData);

    return NextResponse.json({
      success: true,
      data: workItem,
      message: 'Work item created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create work item');
  }
}
