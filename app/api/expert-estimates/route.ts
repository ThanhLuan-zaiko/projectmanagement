// API Route: /api/expert-estimates
// GET - Fetch expert estimates with pagination and filtering
// POST - Create a new expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository, type ExpertTimeEstimate } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateExpertEstimatePayload } from '@/lib/dashboard-validation';

const CONFIDENCE_ORDER: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

type ExpertEstimateListItem = ExpertTimeEstimate & {
  expert_name?: string | null;
  work_item_title?: string | null;
};

// GET /api/expert-estimates?project_id=&work_item_id=&expert_id=&confidence=&method=&page=&limit=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);

    // Filters
    const projectId = searchParams.get('project_id');
    const workItemId = searchParams.get('work_item_id') || '';
    const expertId = searchParams.get('expert_id') || '';
    const search = searchParams.get('search') || '';
    const confidence = searchParams.get('confidence') || 'all';
    const method = searchParams.get('method') || 'all';
    const sortBy = searchParams.get('sort_by') || 'estimated_at';
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

    // Fetch estimates
    let estimates: ExpertEstimateListItem[] = [];

    if (deletedOnly) {
      // Only fetch deleted items (trash)
      estimates = await expertEstimateRepository.findDeleted(projectId);
    } else {
      estimates = await expertEstimateRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (expertId) {
      estimates = estimates.filter((est) => String(est.expert_id) === expertId);
    }

    // Apply server-side filtering
    if (workItemId) {
      estimates = estimates.filter((est) => String(est.work_item_id) === workItemId);
    }
    if (confidence !== 'all') {
      estimates = estimates.filter((est) => est.confidence_level === confidence);
    }
    if (method !== 'all') {
      estimates = estimates.filter((est) => est.estimation_method === method);
    }

    // Enrich with expert names and work item titles
    if (estimates.length > 0) {
      const expertIds = [...new Set(estimates.map((est) => est.expert_id))];
      const workItemIds = [...new Set(estimates.map((est) => est.work_item_id))];
      
      try {
        const expertPromises = expertIds.map((expertId) =>
          db.execute('SELECT expert_id, name FROM experts WHERE project_id = ? AND expert_id = ?', {
            params: [projectId, expertId],
          })
        );
        const expertResults = await Promise.all(expertPromises);
        const workItemPromises = workItemIds.map((workItemId) =>
          db.execute('SELECT work_item_id, title FROM work_items WHERE project_id = ? AND work_item_id = ?', {
            params: [projectId, workItemId],
          })
        );
        const workItemResults = await Promise.all(workItemPromises);
        
        const expertMap = new Map();
        expertResults.forEach((result) => {
          if (result.rows && result.rows.length > 0) {
            const expertIdStr = String(result.rows[0].expert_id);
            expertMap.set(expertIdStr, result.rows[0].name);
          }
        });

        const workItemMap = new Map();
        workItemResults.forEach((result) => {
          if (result.rows && result.rows.length > 0) {
            const workItemIdStr = String(result.rows[0].work_item_id);
            workItemMap.set(workItemIdStr, result.rows[0].title);
          }
        });
        
        estimates = estimates.map((est) => ({
          ...est,
          expert_name: expertMap.get(String(est.expert_id)) || null,
          work_item_title: workItemMap.get(String(est.work_item_id)) || null,
        }));
      } catch (err) {
        console.error('Failed to fetch expert estimate relations:', err);
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      estimates = estimates.filter((est) =>
        [
          est.notes,
          est.estimation_method,
          est.confidence_level,
          est.expert_name,
          est.work_item_title,
        ].some((value) => String(value || '').toLowerCase().includes(searchLower))
      );
    }

    estimates = estimates.sort((a, b) => {
      let aValue: number | string = '';
      let bValue: number | string = '';

      switch (sortBy) {
        case 'estimated_hours':
          aValue = Number(a.estimated_hours || 0);
          bValue = Number(b.estimated_hours || 0);
          break;
        case 'confidence_level':
          aValue = CONFIDENCE_ORDER[String(a.confidence_level || '').toLowerCase()] || 0;
          bValue = CONFIDENCE_ORDER[String(b.confidence_level || '').toLowerCase()] || 0;
          break;
        case 'estimated_at':
        default:
          aValue = new Date(a.estimated_at || 0).getTime();
          bValue = new Date(b.estimated_at || 0).getTime();
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
    const total = estimates.length;
    const totalPages = Math.ceil(total / limit);

    // Apply pagination
    const paginatedItems = estimates.slice(offset, offset + limit);

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
        workItemId,
        expertId,
        search,
        confidence,
        method,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch expert estimates');
  }
}

// POST /api/expert-estimates
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateExpertEstimatePayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted expert estimate fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    // Calculate three-point estimate if method is three_point
    let estimatedHours = sanitizedBody.estimated_hours as number | null | undefined;
    if (
      sanitizedBody.estimation_method === 'three_point' &&
      sanitizedBody.optimistic_hours &&
      sanitizedBody.most_likely_hours &&
      sanitizedBody.pessimistic_hours
    ) {
      estimatedHours = expertEstimateRepository.calculateThreePointEstimate(
        Number(sanitizedBody.optimistic_hours),
        Number(sanitizedBody.most_likely_hours),
        Number(sanitizedBody.pessimistic_hours)
      );
    }

    const estimateData: Partial<ExpertTimeEstimate> = {
      project_id: projectId,
      work_item_id: String(sanitizedBody.work_item_id),
      expert_id: String(sanitizedBody.expert_id),
      estimated_hours: estimatedHours || null,
      confidence_level: sanitizedBody.confidence_level ?? null,
      estimation_method: sanitizedBody.estimation_method ?? null,
      optimistic_hours: sanitizedBody.optimistic_hours ?? null,
      most_likely_hours: sanitizedBody.most_likely_hours ?? null,
      pessimistic_hours: sanitizedBody.pessimistic_hours ?? null,
      notes: sanitizedBody.notes ?? null,
      estimated_by: user.user_id,
    };

    const estimate = await expertEstimateRepository.create(estimateData);

    return NextResponse.json({
      success: true,
      data: estimate,
      message: 'Expert estimate created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create expert estimate');
  }
}
