// API Route: /api/experts
// GET - Fetch list of experts
// POST - Create a new expert

import { NextRequest, NextResponse } from 'next/server';
import { expertRepository, type Expert } from '@/lib/expert-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateExpertPayload } from '@/lib/dashboard-validation';
import { generateUUIDv7 } from '@/utils/uuid';

// GET /api/experts?project_id=&is_active=&availability_status=&search=&page=&limit=
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
    const isActiveStr = searchParams.get('is_active');
    const isActive = isActiveStr === 'true' ? true : isActiveStr === 'false' ? false : undefined;
    const availabilityStatus = searchParams.get('availability_status');
    const search = searchParams.get('search');

    // Pagination & Sorting
    const page = parseIntegerParam(searchParams.get('page'), 1);
    const limit = parseIntegerParam(searchParams.get('limit'), 10);
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
      const getSortValue = (expert: typeof experts[number]) => {
        switch (sortBy) {
          case 'name':
            return String(expert.name || '').toLowerCase();
          case 'experience_years':
            return Number(expert.experience_years || 0);
          case 'hourly_rate':
            return Number(expert.hourly_rate || 0);
          case 'created_at':
          default:
            return new Date(expert.created_at || 0).getTime();
        }
      };

      const aVal = getSortValue(a);
      const bVal = getSortValue(b);
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
    return handleRouteError(error, 'Internal Server Error');
  }
}

// POST /api/experts
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateExpertPayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted expert fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    // Generate UUID for expert
    const expertId = generateUUIDv7();

    const expertData: Partial<Expert> = {
      project_id: projectId,
      expert_id: expertId,
      user_id: sanitizedBody.user_id ?? null,
      name: String(sanitizedBody.name),
      email: sanitizedBody.email ?? null,
      specialization: sanitizedBody.specialization ?? [],
      experience_years: sanitizedBody.experience_years ?? null,
      hourly_rate: sanitizedBody.hourly_rate ?? null,
      currency: sanitizedBody.currency ?? 'USD',
      availability_status: sanitizedBody.availability_status ?? 'available',
      rating: sanitizedBody.rating ?? null,
      is_active: sanitizedBody.is_active ?? true,
    };

    const expert = await expertRepository.create(expertData);

    await db.execute(
      `INSERT INTO expert_project_summary (
        project_id, expert_id, total_estimated_hours, total_work_items,
        average_confidence, completed_estimates, created_at, updated_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      {
        params: [projectId, expertId, 0, 0, null, 0, new Date(), new Date(), user.user_id],
      }
    );

    return NextResponse.json({
      success: true,
      data: { ...expert, id: expertId },
      message: 'Expert created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create expert');
  }
}
