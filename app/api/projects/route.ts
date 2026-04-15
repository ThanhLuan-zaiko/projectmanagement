// API Routes: /api/projects
// GET - List projects (with filters)
// POST - Create a new project

import { NextRequest, NextResponse } from 'next/server';
import { projectRepository, projectTeamRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { getProjectPortfolio } from '@/lib/project-service';
import { validateProjectFormData } from '@/lib/project-validation';

// GET /api/projects
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
    const scopeParam = searchParams.get('scope');
    const scope = (myProjects ? 'member' : scopeParam || 'all') as 'owned' | 'member' | 'all';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '6', 10);
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const deletedOnly = searchParams.get('deleted_only') === 'true';
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const sortBy = searchParams.get('sort_by') || 'updated_at';
    const sortOrder = (searchParams.get('sort_order') || 'desc') as 'asc' | 'desc';

    const portfolio = await getProjectPortfolio(user.user_id, {
      scope,
      page,
      limit,
      includeDeleted,
      deletedOnly,
      search,
      status,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: portfolio.items,
      pagination: {
        page: portfolio.page,
        limit: portfolio.limit,
        total: portfolio.total,
        totalPages: portfolio.totalPages,
        hasNextPage: portfolio.hasNextPage,
        hasPrevPage: portfolio.hasPrevPage,
      },
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
    const validation = validateProjectFormData(body);

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted project fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }

    const sanitizedBody = validation.sanitizedData;

    // Create project
    const project = await projectRepository.createProject({
      project_name: sanitizedBody.project_name,
      description: sanitizedBody.description,
      status: sanitizedBody.status,
      project_leader_id: body.project_leader_id || user.user_id,
      start_date: sanitizedBody.start_date ? new Date(sanitizedBody.start_date) : new Date(),
      target_end_date: sanitizedBody.target_end_date ? new Date(sanitizedBody.target_end_date) : null,
      budget: sanitizedBody.budget,
      currency: sanitizedBody.currency,
      owner_id: user.user_id,
      created_by: user.user_id,
    });

    await projectTeamRepository.addMember(
      project.project_id,
      user.user_id,
      'owner',
      user.user_id,
      ['project:manage', 'project:delete', 'project:restore', 'team:manage']
    );

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
