// API Route: /api/cost-estimates
// GET - Fetch cost estimates with pagination and filtering
// POST - Create a new cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository, type CostEstimate } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseIntegerParam, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateCostEstimatePayload } from '@/lib/dashboard-validation';

type CostEstimateListItem = CostEstimate & {
  work_item_title?: string | null;
};

// GET /api/cost-estimates?project_id=&work_item_id=&estimate_type=&status=&page=&limit=
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
    const search = searchParams.get('search') || '';
    const estimateType = searchParams.get('estimate_type') || 'all';
    const status = searchParams.get('status') || 'all';
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
    let estimates: CostEstimateListItem[] = [];

    if (deletedOnly) {
      // Only fetch deleted items (trash)
      estimates = await costEstimateRepository.findDeleted(projectId);
    } else {
      estimates = await costEstimateRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (workItemId) {
      estimates = estimates.filter((est) => String(est.work_item_id) === workItemId);
    }
    if (estimateType !== 'all') {
      estimates = estimates.filter((est) => est.estimate_type === estimateType);
    }
    if (status !== 'all') {
      estimates = estimates.filter((est) => est.status === status);
    }

    // Enrich with work item titles
    if (estimates.length > 0) {
      const workItemIds = [...new Set(estimates.map((est) => est.work_item_id))];

      try {
        const workItemPromises = workItemIds.map((workItemId) =>
          db.execute('SELECT work_item_id, title FROM work_items WHERE project_id = ? AND work_item_id = ?', {
            params: [projectId, workItemId],
          })
        );
        const workItemResults = await Promise.all(workItemPromises);

        const workItemMap = new Map();
        workItemResults.forEach((result) => {
          if (result.rows && result.rows.length > 0) {
            const workItemIdStr = String(result.rows[0].work_item_id);
            workItemMap.set(workItemIdStr, result.rows[0].title);
          }
        });

        estimates = estimates.map((est) => ({
          ...est,
          work_item_title: workItemMap.get(String(est.work_item_id)) || null,
        }));
      } catch (err) {
        console.error('Failed to fetch work item titles:', err);
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      estimates = estimates.filter((est) =>
        [
          est.notes,
          est.estimate_type,
          est.status,
          est.currency,
          est.work_item_title,
        ].some((value) => String(value || '').toLowerCase().includes(searchLower))
      );
    }

    estimates = estimates.sort((a, b) => {
      let aValue: number | string = '';
      let bValue: number | string = '';

      switch (sortBy) {
        case 'estimated_cost':
          aValue = Number(a.estimated_cost || 0);
          bValue = Number(b.estimated_cost || 0);
          break;
        case 'estimate_type':
          aValue = String(a.estimate_type || '').toLowerCase();
          bValue = String(b.estimate_type || '').toLowerCase();
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
      data: paginatedItems.map(e => ({ 
        ...e, 
        estimate_id: e.estimate_id || e.id,
        id: e.estimate_id || e.id,
        _id: e.estimate_id || e.id,
        key: e.estimate_id || e.id
      })),
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
        search,
        estimateType,
        status,
        sortBy,
        sortOrder,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch cost estimates');
  }
}

// POST /api/cost-estimates
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateCostEstimatePayload(body, 'create');

    if (!validation.sanitizedData) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted cost estimate fields.',
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }
    const sanitizedBody = validation.sanitizedData;
    const projectId = String(sanitizedBody.project_id);
    await requireProjectAccess(projectId, user.user_id, 'write');

    // Calculate estimated_cost from hourly_rate * hours for labor type
    let estimatedCost = sanitizedBody.estimated_cost as number | null | undefined;
    if (sanitizedBody.estimate_type === 'labor' && sanitizedBody.hourly_rate && sanitizedBody.hours) {
      estimatedCost = Number(sanitizedBody.hourly_rate) * Number(sanitizedBody.hours);
    } else if (sanitizedBody.estimate_type === 'material' && sanitizedBody.quantity && sanitizedBody.unit_cost) {
      estimatedCost = Number(sanitizedBody.quantity) * Number(sanitizedBody.unit_cost);
    }

    const estimateData: Partial<CostEstimate> = {
      project_id: projectId,
      work_item_id: String(sanitizedBody.work_item_id),
      estimate_type: sanitizedBody.estimate_type ?? 'labor',
      estimated_cost: estimatedCost || null,
      currency: sanitizedBody.currency ?? 'USD',
      hourly_rate: sanitizedBody.hourly_rate ?? null,
      hours: sanitizedBody.hours ?? null,
      quantity: sanitizedBody.quantity ?? null,
      unit_cost: sanitizedBody.unit_cost ?? null,
      notes: sanitizedBody.notes ?? null,
      status: sanitizedBody.status ?? 'draft',
      estimated_by: user.user_id,
    };

    const estimate = await costEstimateRepository.create(estimateData);

    return NextResponse.json({
      success: true,
      data: estimate,
      message: 'Cost estimate created successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to create cost estimate');
  }
}
