import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { requireProjectCodeAccess } from '@/lib/project-access';
import { errorResponse, handleRouteError } from '@/lib/api-route';
import { validateProjectCodeParam } from '@/lib/dashboard-validation';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const projectCodeInput = searchParams.get('project_code') || '';
    const projectCode = validateProjectCodeParam(projectCodeInput);

    if (projectCode.error) {
      return errorResponse(400, projectCode.error, {
        fieldErrors: {
          project_code: projectCode.error,
        },
      });
    }

    const access = await requireProjectCodeAccess(projectCode.value, user.user_id);

    return NextResponse.json({
      success: true,
      data: access.project,
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to load project access');
  }
}
