// API Routes: /api/projects
// GET - List projects (with filters)
// POST - Create a new project

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';

// GET /api/projects?my=true|false
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
    const myProjects = searchParams.get('my') === 'true';

    let projects;
    if (myProjects) {
      // Get projects user is involved in
      projects = await projectRepository.findUserProjects(user.user_id);
    } else {
      // Get projects owned by user
      projects = await projectRepository.findByOwnerId(user.user_id);
    }

    return NextResponse.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects
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
    if (!body.project_name) {
      return NextResponse.json(
        { success: false, error: 'Project name is required' },
        { status: 400 }
      );
    }

    // Create project
    const project = await projectRepository.createProject({
      project_name: body.project_name,
      description: body.description || '',
      status: body.status || 'planning',
      project_leader_id: body.project_leader_id || user.user_id,
      start_date: body.start_date ? new Date(body.start_date) : new Date(),
      target_end_date: body.target_end_date ? new Date(body.target_end_date) : null,
      budget: body.budget ? parseFloat(body.budget) : null,
      currency: body.currency || 'USD',
      owner_id: user.user_id,
      created_by: user.user_id,
    });

    return NextResponse.json({
      success: true,
      data: project,
      message: 'Project created successfully',
    });
  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
