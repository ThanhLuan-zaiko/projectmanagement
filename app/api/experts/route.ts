// API Route: /api/experts
// GET - Fetch list of experts
// POST - Create a new expert

import { NextRequest, NextResponse } from 'next/server';
import { expertRepository } from '@/lib/expert-repository';
import { getCurrentUser } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// GET /api/experts?is_active=&availability_status=&search=&page=&limit=
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
    const isActive = searchParams.get('is_active');
    const availabilityStatus = searchParams.get('availability_status');
    const search = searchParams.get('search');

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch experts
    let experts: any[] = [];

    if (search) {
      experts = await expertRepository.search(search);
    } else if (isActive === 'true') {
      // Only active experts
      experts = await expertRepository.findActive();
    } else if (isActive === 'false') {
      // Only inactive experts
      const allExperts = await expertRepository.findAllWithOptions({ limit: 1000 });
      experts = allExperts.filter(e => e.is_active === false);
    } else if (availabilityStatus) {
      experts = await expertRepository.findAllWithOptions({
        availabilityStatus: availabilityStatus,
        limit: 1000,
      });
    } else {
      // Default: fetch ALL experts (both active and inactive)
      experts = await expertRepository.findAllWithOptions({ limit: 1000 });
    }

    // Apply sorting
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    experts = experts.sort((a, b) => {
      const aValue = (a as any)[sortBy];
      const bValue = (b as any)[sortBy];
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });

    // Calculate total
    const total = experts.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);

    // Apply pagination
    const paginatedExperts = experts.slice(offset, offset + limit);

    // Format response
    const formattedExperts = paginatedExperts.map(expert => ({
      id: expert.expert_id,
      expert_id: expert.expert_id,
      name: expert.name,
      email: expert.email,
      specialization: expert.specialization || [],
      experience_years: expert.experience_years,
      hourly_rate: expert.hourly_rate,
      currency: expert.currency,
      availability_status: expert.availability_status,
      rating: expert.rating,
      is_active: expert.is_active,
      created_at: expert.created_at,
    }));

    return NextResponse.json({
      success: true,
      data: formattedExperts,
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
    return NextResponse.json(
      { success: false, error: 'Failed to fetch experts' },
      { status: 500 }
    );
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

    return NextResponse.json({
      success: true,
      data: expert,
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
