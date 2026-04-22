// API Route: /api/dashboard/stats
// GET - Fetch dashboard aggregated statistics

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/config';
import { WorkItem } from '@/lib/work-item-repository';
import { errorResponse, handleRouteError } from '@/lib/api-route';
import { requireProjectAccess } from '@/lib/project-access';

// GET /api/dashboard/stats?project_id=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse(401, 'Unauthorized');
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('project_id');

    if (!projectId) {
      return errorResponse(400, 'Project ID is required');
    }
    await requireProjectAccess(projectId, user.user_id, 'read');

    // Fetch all work items for the project
    const workItemsQuery = `
      SELECT * FROM work_items
      WHERE project_id = ?
    `;
    const workItemsResult = await db.execute(workItemsQuery, {
      params: [projectId]
    });
    const workItems = workItemsResult.rows as unknown as WorkItem[];

    // Calculate statistics
    const totalTasks = workItems.length;
    
    // Status distribution
    const statusCount: Record<string, number> = {};
    workItems.forEach((item) => {
      const status = item.status || 'unknown';
      statusCount[status] = (statusCount[status] || 0) + 1;
    });

    // Priority distribution
    const priorityCount: Record<string, number> = {};
    workItems.forEach((item) => {
      const priority = item.priority || 'unknown';
      priorityCount[priority] = (priorityCount[priority] || 0) + 1;
    });

    // Work type distribution
    const typeCount: Record<string, number> = {};
    workItems.forEach((item) => {
      const workType = item.work_type || 'unknown';
      typeCount[workType] = (typeCount[workType] || 0) + 1;
    });

    // Estimated vs Actual hours
    let totalEstimatedHours = 0;
    let totalActualHours = 0;
    let tasksWithHours = 0;

    workItems.forEach((item) => {
      if (item.estimated_hours || item.actual_hours) {
        tasksWithHours++;
        totalEstimatedHours += Number(item.estimated_hours || 0);
        totalActualHours += Number(item.actual_hours || 0);
      }
    });

    // Overdue tasks (due_date < now and not done/cancelled)
    const now = new Date();
    const overdueTasks = workItems.filter((item) => {
      if (!item.due_date || item.status === 'done' || item.status === 'cancelled') {
        return false;
      }
      const dueDate = new Date(item.due_date!);
      return dueDate < now;
    });

    // Tasks by assignee
    const assigneeData: Record<string, { count: number; hours: number }> = {};
    workItems.forEach((item) => {
      if (item.assigned_to) {
        if (!assigneeData[item.assigned_to]) {
          assigneeData[item.assigned_to] = { count: 0, hours: 0 };
        }
        assigneeData[item.assigned_to].count++;
        assigneeData[item.assigned_to].hours += Number(item.estimated_hours || 0);
      }
    });

    const workloadByAssignee = Object.entries(assigneeData)
      .map(([userId, data]) => ({
        name: `User ${userId.substring(0, 8)}`,
        taskCount: data.count,
        estimatedHours: data.hours,
      }))
      .sort((a, b) => b.taskCount - a.taskCount);

    // Tasks created in last 30 days (for trend chart)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentTasks = workItems.filter((item) => {
      const createdAt = new Date(item.created_at);
      return createdAt >= thirtyDaysAgo;
    });

    // Group by date for trend
    const trendData: Record<string, number> = {};
    recentTasks.forEach((item) => {
      const date = new Date(item.created_at).toISOString().split('T')[0];
      trendData[date] = (trendData[date] || 0) + 1;
    });

    const trendArray = Object.entries(trendData)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task type distribution over time (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    
    const typeTrendData: Record<string, { task: number; bug: number; milestone: number; subtask: number }> = {};
    workItems.forEach((item) => {
      const createdAt = new Date(item.created_at);
      if (createdAt >= fourteenDaysAgo) {
        const date = createdAt.toISOString().split('T')[0];
        if (!typeTrendData[date]) {
          typeTrendData[date] = { task: 0, bug: 0, milestone: 0, subtask: 0 };
        }
        const workType = item.work_type || 'task';
        if (workType in typeTrendData[date]) {
          (typeTrendData[date] as Record<string, number>)[workType]++;
        }
      }
    });

    const typeTrendArray = Object.entries(typeTrendData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Priority trend over time (last 14 days)
    const priorityTrendData: Record<string, { low: number; medium: number; high: number; urgent: number }> = {};
    workItems.forEach((item) => {
      const createdAt = new Date(item.created_at);
      if (createdAt >= fourteenDaysAgo) {
        const date = createdAt.toISOString().split('T')[0];
        if (!priorityTrendData[date]) {
          priorityTrendData[date] = { low: 0, medium: 0, high: 0, urgent: 0 };
        }
        const priority = item.priority || 'medium';
        if (priority in priorityTrendData[date]) {
          (priorityTrendData[date] as Record<string, number>)[priority]++;
        }
      }
    });

    const priorityTrendArray = Object.entries(priorityTrendData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Task completion rate (last 14 days)
    const completionData: Record<string, { created: number; completed: number }> = {};
    workItems.forEach((item) => {
      const createdAt = new Date(item.created_at);
      if (createdAt >= fourteenDaysAgo) {
        const date = createdAt.toISOString().split('T')[0];
        if (!completionData[date]) {
          completionData[date] = { created: 0, completed: 0 };
        }
        completionData[date].created++;
        if (item.status === 'done') {
          completionData[date].completed++;
        }
      }
    });

    const completionArray = Object.entries(completionData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Weekly workload pattern
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const weeklyData: Record<string, { tasks: number; hours: number }> = {};
    workItems.forEach((item) => {
      const createdAt = new Date(item.created_at);
      const day = dayNames[createdAt.getDay()];
      if (!weeklyData[day]) {
        weeklyData[day] = { tasks: 0, hours: 0 };
      }
      weeklyData[day].tasks++;
      weeklyData[day].hours += Number(item.estimated_hours || 0);
    });

    const weeklyArray = dayNames.map((day) => ({
      day,
      tasks: weeklyData[day]?.tasks || 0,
      hours: weeklyData[day]?.hours || 0,
    }));

    // Status flow over time (last 14 days)
    const statusFlowData: Record<string, { todo: number; inProgress: number; review: number; done: number }> = {};
    workItems.forEach((item) => {
      const updatedAt = new Date(item.updated_at || item.created_at);
      if (updatedAt >= fourteenDaysAgo) {
        const date = updatedAt.toISOString().split('T')[0];
        if (!statusFlowData[date]) {
          statusFlowData[date] = { todo: 0, inProgress: 0, review: 0, done: 0 };
        }
        const status = item.status || 'todo';
        const statusMap: Record<string, keyof typeof statusFlowData[string]> = {
          'todo': 'todo',
          'in_progress': 'inProgress',
          'review': 'review',
          'done': 'done',
        };
        if (status in statusMap) {
          (statusFlowData[date] as Record<string, number>)[statusMap[status]]++;
        }
      }
    });

    const statusFlowArray = Object.entries(statusFlowData)
      .map(([date, counts]) => ({ date, ...counts }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Recent activity (last 5 items by updated_at)
    const recentActivity = workItems
      .sort((a, b) => {
        const dateA = new Date(a.updated_at || a.created_at).getTime();
        const dateB = new Date(b.updated_at || b.created_at).getTime();
        return dateB - dateA;
      })
      .slice(0, 5)
      .map((item) => ({
        id: item.work_item_id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        updated_at: item.updated_at || item.created_at,
        assigned_to: item.assigned_to,
      }));

    // Upcoming deadlines (next 7 days)
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    const upcomingDeadlines = workItems
      .filter((item) => {
        if (!item.due_date || item.status === 'done' || item.status === 'cancelled') {
          return false;
        }
        const dueDate = new Date(item.due_date!);
        return dueDate >= now && dueDate <= sevenDaysFromNow;
      })
      .sort((a, b) => {
        const dateA = new Date(a.due_date!).getTime();
        const dateB = new Date(b.due_date!).getTime();
        return dateA - dateB;
      })
      .slice(0, 5)
      .map((item) => ({
        id: item.work_item_id,
        title: item.title,
        due_date: item.due_date,
        status: item.status,
        priority: item.priority,
      }));

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          totalTasks,
          inProgress: statusCount['in_progress'] || 0,
          completed: statusCount['done'] || 0,
          overdue: overdueTasks.length,
          totalEstimatedHours: totalEstimatedHours.toFixed(2),
          totalActualHours: totalActualHours.toFixed(2),
          tasksWithEstimates: tasksWithHours,
        },
        statusDistribution: Object.entries(statusCount).map(([name, count]) => ({
          name: name.replace('_', ' ').toUpperCase(),
          count,
        })),
        priorityDistribution: Object.entries(priorityCount).map(([name, count]) => ({
          name: name.toUpperCase(),
          count,
        })),
        hoursComparison: {
          estimated: totalEstimatedHours,
          actual: totalActualHours,
        },
        taskTrend: trendArray,
        workloadByAssignee,
        taskTypeDistribution: typeTrendArray,
        taskCompletionRate: completionArray,
        priorityTrend: priorityTrendArray,
        weeklyWorkload: weeklyArray,
        statusFlow: statusFlowArray,
        recentActivity,
        upcomingDeadlines,
      },
    });
  } catch (error) {
    return handleRouteError(error, 'Failed to fetch dashboard statistics');
  }
}
