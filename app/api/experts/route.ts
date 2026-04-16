// API Route: /api/experts
// GET - Fetch list of experts
// POST - Create a new expert

import { NextRequest, NextResponse } from 'next/server';
import { expertRepository } from '@/lib/expert-repository';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/config';

// GET /api/experts?project_id=&is_active=&availability_status=&search=&page=&limit=
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
    const projectId = searchParams.get('project_id') || '00000000-0000-0000-0000-000000000001';

    // Filters
    const isActiveStr = searchParams.get('is_active');
    const isActive = isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;
    const availabilityStatus = searchParams.get('availability_status');
    const search = searchParams.get('search');

    // Pagination & Sorting
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';

    // 1. Fetch experts associated with this project using the new repository method
    let experts = await expertRepository.findByProjectId(projectId, { 
      limit: 1000, 
      isActive 
    });

    // 2. Apply additional filters (Availability, Search)
    if (availabilityStatus && availabilityStatus !== 'all') {
      experts = experts.filter((e) => e.availability_status === availabilityStatus);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      experts = experts.filter((e) => 
        e.name?.toLowerCase().includes(searchLower) || 
        (Array.isArray(e.specialization) && e.specialization.some((s: string) => s.toLowerCase().includes(searchLower)))
      );
    }

    // 3. Apply sorting
    experts.sort((a, b) => {
      const aVal = (a as any)[sortBy] || '';
      const bVal = (b as any)[sortBy] || '';
      return sortOrder === 'asc' ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
    });

    // 4. Calculate total and paginate
    const total = experts.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const paginatedExperts = experts.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      data: paginatedExperts.map(e => ({ ...e, id: e.expert_id })),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error fetching experts:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/experts
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
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: 'Name is required' },
        { status: 400 }
      );
    }

    // Generate UUID for expert
    const expertId = uuidv4();

    // Parse specialization from comma-separated string or array
    let specialization = body.specialization;
    if (typeof specialization === 'string') {
      specialization = specialization.split(',').map((s: string) => s.trim()).filter(Boolean);
    }

    const expertData = {
      expert_id: expertId,
      user_id: body.user_id || null,
      name: body.name,
      email: body.email || null,
      specialization: specialization || [],
      experience_years: body.experience_years ? parseInt(body.experience_years) : null,
      hourly_rate: body.hourly_rate ? parseFloat(body.hourly_rate) : null,
      currency: body.currency || 'USD',
      availability_status: body.availability_status || 'available',
      rating: body.rating ? parseFloat(body.rating) : null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      created_at: new Date(),
    };

    const expert = await expertRepository.create(expertData);

    // Associate expert with project in expert_project_summary
    const projectId = body.project_id || '00000000-0000-0000-0000-000000000001';
    
    console.log(`Associating expert ${expertId} with project ${projectId}`);
    
    await db.execute(
      'INSERT INTO expert_project_summary (project_id, expert_id, total_estimated_hours, total_work_items, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      { params: [projectId, expertId, 0, 0, new Date(), new Date()] }
    );

    return NextResponse.json({
      success: true,
      data: { ...expert, id: expertId },
      message: 'Expert created successfully',
    });
  } catch (error) {
    console.error('Error creating expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expert' },
      { status: 500 }
    );
  }
}
