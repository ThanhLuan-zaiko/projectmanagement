import { NextRequest, NextResponse } from 'next/server';
import { projectRepository } from '@/lib/project-repository';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { projectId } = await params;
    const project = await projectRepository.findById(projectId, { includeDeleted: true });

    if (!project) {
      return NextResponse.json(
        { success: false, error: 'Project not found' },
        { status: 404 }
      );
    }

    if (project.owner_id !== user.user_id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 }
      );
    }

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
    console.error('Error restoring project:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to restore project' },
      { status: 500 }
    );
  }
}
