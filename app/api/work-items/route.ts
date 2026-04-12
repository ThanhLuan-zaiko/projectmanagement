// API Route: /api/work-items
// GET - Fetch work items with pagination and server-side filtering
// POST - Create a new work item

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/work-items?search=&status=&priority=&work_type=&page=&limit=&sort_by=&sort_order=
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const priority = searchParams.get('priority') || 'all';
    const workType = searchParams.get('work_type') || 'all';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    // Sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // Fetch all work items for the user
    let workItems = await workItemRepository.findByCreator(user.user_id);

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
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      
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
    console.error('Error fetching work items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch work items' },
      { status: 500 }
    );
  }
}

// POST /api/work-items
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
    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    if (!body.project_id) {
      // For demo purposes, we'll use a default project ID
      body.project_id = '00000000-0000-0000-0000-000000000001';
    }

    // Generate UUID for work item
    const workItemId = uuidv4();

    const workItemData = {
      work_item_id: workItemId,
      project_id: body.project_id,
      title: body.title,
      description: body.description || '',
      work_type: body.work_type || 'task',
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      created_by: user.user_id,
      assigned_to: body.assigned_to || null,
      due_date: body.due_date || null,
      estimated_hours: body.estimated_hours || null,
      actual_hours: body.actual_hours || null,
      parent_work_item_id: body.parent_work_item_id || null,
      tags: body.tags || [],
      attachments: body.attachments || [],
    };

    const workItem = await workItemRepository.create(workItemData);

    return NextResponse.json({
      success: true,
      data: workItem,
      message: 'Work item created successfully',
    });
  } catch (error) {
    console.error('Error creating work item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create work item' },
      { status: 500 }
    );
  }
}
