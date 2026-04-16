// API Route: /api/experts/[id]
// GET - Get a specific expert
// PUT - Update an expert
// DELETE - Delete an expert

import { NextRequest, NextResponse } from 'next/server';
import { expertRepository } from '@/lib/expert-repository';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/experts/[id]
export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const expert = await expertRepository.findById(id);

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: expert,
    });
  } catch (error) {
    console.error('Error fetching expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert' },
      { status: 500 }
    );
  }
}

// PUT /api/experts/[id]
export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const body = await request.json();

    const expert = await expertRepository.findById(id);
    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};

    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email || null;
    if (body.specialization !== undefined) {
      let specialization = body.specialization;
      if (typeof specialization === 'string') {
        specialization = specialization.split(',').map((s: string) => s.trim()).filter(Boolean);
      }
      updateData.specialization = specialization;
    }
    if (body.experience_years !== undefined) {
      updateData.experience_years = body.experience_years ? parseInt(body.experience_years) : null;
    }
    if (body.hourly_rate !== undefined) {
      updateData.hourly_rate = body.hourly_rate ? parseFloat(body.hourly_rate) : null;
    }
    if (body.currency !== undefined) updateData.currency = body.currency;
    if (body.availability_status !== undefined) updateData.availability_status = body.availability_status;
    if (body.rating !== undefined) {
      updateData.rating = body.rating ? parseFloat(body.rating) : null;
    }
    if (body.is_active !== undefined) updateData.is_active = body.is_active;

    const updatedExpert = await expertRepository.update(id, updateData);

    return NextResponse.json({
      success: true,
      data: updatedExpert,
      message: 'Expert updated successfully',
    });
  } catch (error) {
    console.error('Error updating expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update expert' },
      { status: 500 }
    );
  }
}

// DELETE /api/experts/[id]
export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const expert = await expertRepository.findById(id);

    if (!expert) {
      return NextResponse.json(
        { success: false, error: 'Expert not found' },
        { status: 404 }
      );
    }

    if (permanent) {
      // 1. Find all project associations for this expert
      try {
        const associations = await db.execute(
          'SELECT project_id FROM expert_project_summary WHERE expert_id = ? ALLOW FILTERING',
          { params: [id] }
        );
        
        // 2. Clear associations from summary table using explicit keys
        if (associations.rows.length > 0) {
          for (const row of associations.rows) {
            await db.execute(
              'DELETE FROM expert_project_summary WHERE project_id = ? AND expert_id = ?',
              { params: [row.project_id, id] }
            );
          }
        }
      } catch (err) {
        console.error('Failed to clean up associations:', err);
      }

      // 3. Permanent delete from experts table
      await expertRepository.permanentDelete(id);
      
      return NextResponse.json({
        success: true,
        message: 'Expert permanently deleted',
      });
    } else {
      // Soft delete - set is_active to false
      await expertRepository.update(id, { is_active: false });
      return NextResponse.json({
        success: true,
        message: 'Expert deactivated successfully',
      });
    }
  } catch (error) {
    console.error('Error deleting expert:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete expert' },
      { status: 500 }
    );
  }
}
