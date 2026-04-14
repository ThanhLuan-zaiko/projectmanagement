// API Route: /api/expert-estimates
// GET - Fetch expert estimates with pagination and filtering
// POST - Create a new expert estimate

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';

// GET /api/expert-estimates?project_id=&work_item_id=&expert_id=&confidence=&method=&page=&limit=
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
    const expertId = searchParams.get('expert_id') || '';
    const confidence = searchParams.get('confidence') || 'all';
    const method = searchParams.get('method') || 'all';
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
      estimates = await expertEstimateRepository.findDeleted(projectId);
    } else {
      estimates = await expertEstimateRepository.findByProjectId(projectId, { limit: 1000, includeDeleted });
    }

    // Apply server-side filtering
    if (expertId) {
      estimates = estimates.filter((est) => est.expert_id === expertId);
    }

    // Apply server-side filtering
    if (workItemId) {
      estimates = estimates.filter((est) => est.work_item_id === workItemId);
    }
    if (confidence !== 'all') {
      estimates = estimates.filter((est) => est.confidence_level === confidence);
    }
    if (method !== 'all') {
      estimates = estimates.filter((est) => est.estimation_method === method);
    }

    // Enrich with expert names
    if (estimates.length > 0) {
      const expertIds = [...new Set(estimates.map((est) => est.expert_id))];
      
      try {
        const expertPromises = expertIds.map((expertId) =>
          db.execute('SELECT expert_id, name FROM experts WHERE expert_id = ?', { params: [expertId] })
        );
        const expertResults = await Promise.all(expertPromises);
        
        const expertMap = new Map();
        expertResults.forEach((result) => {
          if (result.rows && result.rows.length > 0) {
            const expertIdStr = String(result.rows[0].expert_id);
            expertMap.set(expertIdStr, result.rows[0].name);
          }
        });
        
        estimates = estimates.map((est) => ({
          ...est,
          expert_name: expertMap.get(String(est.expert_id)) || null,
        }));
      } catch (err) {
        console.error('Failed to fetch expert names:', err);
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
        expertId,
        confidence,
        method,
      },
    });
  } catch (error) {
    console.error('Error fetching expert estimates:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert estimates' },
      { status: 500 }
    );
  }
}

// POST /api/expert-estimates
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

    if (!body.expert_id) {
      return NextResponse.json(
        { success: false, error: 'Expert ID is required' },
        { status: 400 }
      );
    }

    // Calculate three-point estimate if method is three_point
    let estimatedHours = body.estimated_hours;
    if (body.estimation_method === 'three_point' && body.optimistic_hours && body.most_likely_hours && body.pessimistic_hours) {
      estimatedHours = expertEstimateRepository.calculateThreePointEstimate(
        body.optimistic_hours,
        body.most_likely_hours,
        body.pessimistic_hours
      );
    }

    const estimateData = {
      project_id: body.project_id,
      work_item_id: body.work_item_id,
      expert_id: body.expert_id,
      estimated_hours: estimatedHours || null,
      confidence_level: body.confidence_level || null,
      estimation_method: body.estimation_method || null,
      optimistic_hours: body.optimistic_hours || null,
      most_likely_hours: body.most_likely_hours || null,
      pessimistic_hours: body.pessimistic_hours || null,
      notes: body.notes || null,
      estimated_by: user.user_id,
    };

    const estimate = await expertEstimateRepository.create(estimateData);

    return NextResponse.json({
      success: true,
      data: estimate,
      message: 'Expert estimate created successfully',
    });
  } catch (error) {
    console.error('Error creating expert estimate:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create expert estimate' },
      { status: 500 }
    );
  }
}
