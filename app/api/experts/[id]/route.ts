// API Route: /api/experts/[id]
// GET - Get a specific expert
// PUT - Update an expert
// DELETE - Delete an expert

import { NextRequest, NextResponse } from 'next/server';
import { expertRepository } from '@/lib/expert-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { errorResponse, handleRouteError, parseJsonBody, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';
import { validateExpertPayload } from '@/lib/dashboard-validation';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/experts/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }

    await requireProjectAccess(projectId, user.user_id, 'read');
    const expert = await expertRepository.findById(id, { params: [projectId] });

    if (!expert) {
      return errorResponse(404, 'Expert not found');
    }

    return NextResponse.json({
      success: true,
      data: expert,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch expert');
  }
}

// PUT /api/experts/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    requireCsrf(request);
    const body = await parseJsonBody(request);
    const validation = validateExpertPayload(body, 'update');
    const projectId = String((validation.sanitizedData?.project_id as string | undefined) || '');

    if (!validation.sanitizedData || !projectId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Please correct the highlighted expert fields.',
          fieldErrors: {
            ...(validation.fieldErrors || {}),
            ...(!projectId ? { project_id: 'Project ID is required.' } : {}),
          },
        },
        { status: 400 }
      );
    }

    await requireProjectAccess(projectId, user.user_id, 'write');
    const expert = await expertRepository.findById(id, { params: [projectId] });
    if (!expert) {
      return errorResponse(404, 'Expert not found');
    }
    const sanitizedBody = validation.sanitizedData;

    const updateData: Record<string, unknown> = {
      ...sanitizedBody,
      project_id: projectId,
    };

    const updatedExpert = await expertRepository.update(id, updateData, { project_id: projectId });

    return NextResponse.json({
      success: true,
      data: updatedExpert,
      message: 'Expert updated successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to update expert');
  }
}

// DELETE /api/experts/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }
    requireCsrf(request);
    await requireProjectAccess(projectId, user.user_id, 'write');

    const expert = await expertRepository.findById(id, { params: [projectId] });

    if (!expert) {
      return errorResponse(404, 'Expert not found');
    }

    if (permanent) {
      await db.execute(
        'DELETE FROM expert_project_summary WHERE project_id = ? AND expert_id = ?',
        { params: [projectId, id] }
      );
      await expertRepository.permanentDelete(id, projectId);
      
      return NextResponse.json({
        success: true,
        message: 'Expert permanently deleted',
      });
    } else {
      // Soft delete - set is_active to false
      await expertRepository.update(id, { project_id: projectId, is_active: false }, { project_id: projectId });
      return NextResponse.json({
        success: true,
        message: 'Expert deactivated successfully',
      });
    }
  } catch (error) {
    return handleRouteError(error, 'Failed to delete expert');
  }
}
