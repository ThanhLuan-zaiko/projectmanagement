// API Route: /api/expert-estimates/summary
// GET - Get project summary for expert estimates

import { NextRequest, NextResponse } from 'next/server';
import { expertEstimateRepository } from '@/lib/expert-estimate-repository';
import { getCurrentUser } from '@/lib/auth';

// GET /api/expert-estimates/summary?project_id=
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
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return NextResponse.json(
        { success: false, error: 'Project ID is required' },
        { status: 400 }
      );
    }

    // Get project statistics
    const statistics = await expertEstimateRepository.getProjectStatistics(projectId);

    // Get all unique experts for this project
    const estimates = await expertEstimateRepository.findByProjectId(projectId, { limit: 1000 });
    const uniqueExperts = [...new Set(estimates.map(est => est.expert_id))];

    // Get summary for each expert
    const expertSummaries = await Promise.all(
      uniqueExperts.map(async (expertId) => {
        const summary = await expertEstimateRepository.getProjectSummary(projectId, expertId);
        if (summary) {
          return summary;
        }

        // Calculate summary from estimates if not found in summary table
        const expertEstimates = estimates.filter(est => est.expert_id === expertId);
        return {
          project_id: projectId,
          expert_id: expertId,
          total_estimated_hours: expertEstimates.reduce((sum, est) => sum + (est.estimated_hours || 0), 0),
          total_work_items: expertEstimates.length,
          average_confidence: statistics.averageConfidence,
          completed_estimates: expertEstimates.length,
          created_at: new Date(),
          updated_at: new Date(),
          created_by: user.user_id,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        statistics,
        expertSummaries,
      },
    });
  } catch (error) {
    console.error('Error fetching expert estimate summary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch expert estimate summary' },
      { status: 500 }
    );
  }
}
