// API Route: /api/work-items
// GET - Fetch all work items
// POST - Create a new work item

import { NextRequest, NextResponse } from 'next/server';
import { workItemRepository } from '@/lib/work-item-repository';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/work-items
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
    const projectId = searchParams.get('project_id');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const workType = searchParams.get('work_type');
    const assignee = searchParams.get('assignee');
    const search = searchParams.get('search');

    let workItems;

    // If no specific filters, get all work items for the user
    if (!projectId && !status && !priority && !workType && !assignee && !search) {
      workItems = await workItemRepository.findByCreator(user.user_id);
    } else if (search && projectId) {
      workItems = await workItemRepository.search(projectId, search);
    } else if (status && projectId) {
      workItems = await workItemRepository.findByStatus(projectId, status);
    } else if (priority && projectId) {
      workItems = await workItemRepository.findByPriority(projectId, priority);
    } else if (workType && projectId) {
      workItems = await workItemRepository.findByWorkType(projectId, workType);
    } else if (assignee) {
      workItems = await workItemRepository.findByAssignee(assignee);
    } else if (projectId) {
      workItems = await workItemRepository.findByProjectId(projectId);
    } else {
      workItems = await workItemRepository.findAll();
    }

    return NextResponse.json({
      success: true,
      data: workItems,
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
