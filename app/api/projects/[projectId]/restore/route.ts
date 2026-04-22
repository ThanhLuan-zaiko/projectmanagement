import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';
import { errorResponse, handleRouteError, requireCsrf } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    requireCsrf(request);
    const { projectId } = await params;
    const access = await requireProjectAccess(projectId, user.user_id, 'owner', { includeDeleted: true });
    const project = access.project;

    if (!project.is_deleted) {
      return NextResponse.json(
        { success: false, error: 'Project is not in trash' },
        { status: 400 }
      );
    }

    await projectRepository.restoreProject(projectId);

    return NextResponse.json({
      success: true,
      message: 'Project restored successfully',
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to restore project');
  }
}
