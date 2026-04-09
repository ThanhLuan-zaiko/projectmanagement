import { NextRequest, NextResponse } from 'next/server';
import { runCleanupTasks } from '@/utils/cleanup';

// This endpoint should be called by a cron job or scheduled task
// Example: curl -X POST http://localhost:3000/api/admin/cleanup

export async function POST(request: NextRequest) {
  try {
    // In production, add authentication here (API key, admin check, etc.)
    // For now, we'll just run the cleanup
    
    const results = await runCleanupTasks();

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed successfully',
      results,
    });
  } catch (error) {
    console.error('Cleanup API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
