// API Route: /api/cost-estimates
// GET - Fetch cost estimates with pagination and filtering
// POST - Create a new cost estimate

import { NextRequest, NextResponse } from 'next/server';
import { costEstimateRepository } from '@/lib/cost-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';

// GET /api/cost-estimates?project_id=&work_item_id=&estimate_type=&status=&page=&limit=
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
    const projectId = searchParams.get('project_id') || '00000000-0000-0000-0000-000000000001';
    const workItemId = searchParams.get('work_item_id') || '';
    const estimateType = searchParams.get('estimate_type') || 'all';
    const status = searchParams.get('status') || 'all';
    const includeDeleted = searchParams.get('include_deleted') === 'true';
    const deletedOnly = searchParams.get('deleted_only') === 'true';

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Fetch estimates
    let estimates: any[] = [];

    if (deletedOnly) {
      // Only fetch deleted items (trash)
      estimates = await costEstimateRepository.findDeleted(projectId);
    } else {
      estimates = await costEstimateRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (workItemId) {
      estimates = estimates.filter((est) => est.work_item_id === workItemId);
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
          db.execute('SELECT work_item_id, title FROM work_items WHERE work_item_id = ?', { params: [workItemId] })
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
        estimateType,
        status,
      },
    });
  } catch (error) {
    console.error('Error fetching cost estimates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch cost estimates' },
      { status: 500 }
    );
  }
}

// POST /api/cost-estimates
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
    if (!body.project_id) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    if (!body.work_item_id) {
      return NextResponse.json(
        { success: false, error: 'Work item ID is required' },
        { status: 400 }
      );
    }

    if (!body.estimate_type) {
      return NextResponse.json(
        { success: false, error: 'Estimate type is required' },
        { status: 400 }
      );
    }

    // Calculate estimated_cost from hourly_rate * hours for labor type
    let estimatedCost = body.estimated_cost;
    if (body.estimate_type === 'labor' && body.hourly_rate && body.hours) {
      estimatedCost = body.hourly_rate * body.hours;
    } else if (body.estimate_type === 'material' && body.quantity && body.unit_cost) {
      estimatedCost = body.quantity * body.unit_cost;
    }

    const estimateData = {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
      estimate_type: body.estimate_type,
      estimated_cost: estimatedCost || null,
      currency: body.currency || 'USD',
      hourly_rate: body.hourly_rate || null,
      hours: body.hours || null,
      quantity: body.quantity || null,
      unit_cost: body.unit_cost || null,
      notes: body.notes || null,
      status: body.status || 'draft',
      estimated_by: user.user_id,
    };

    const estimate = await costEstimateRepository.create(estimateData);

    return NextResponse.json({
      success: true,
      data: estimate,
      message: 'Cost estimate created successfully',
    });
  } catch (error) {
    console.error('Error creating cost estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create cost estimate' },
      { status: 500 }
    );
  }
}
