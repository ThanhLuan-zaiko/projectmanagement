import { useState, useEffect, useCallback } from 'react';
import { apiFetch } from '@/utils/api-client';

interface DashboardKPIs {
  totalTasks: number;
  inProgress: number;
  completed: number;
  overdue: number;
  totalEstimatedHours: string;
  totalActualHours: string;
  tasksWithEstimates: number;
}

interface DistributionItem {
  name: string;
  count: number;
}

interface HoursComparison {
  estimated: number;
  actual: number;
}

interface TrendItem {
  date: string;
  count: number;
}

interface ActivityItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  updated_at: Date;
  assigned_to: string | null;
}

interface DeadlineItem {
  id: string;
  title: string;
  due_date: Date;
  status: string;
  priority: string;
}

interface WorkloadItem {
  name: string;
  taskCount: number;
  estimatedHours: number;
}

interface TaskTypeTrendItem {
  date: string;
  task: number;
  bug: number;
  milestone: number;
  subtask: number;
}

interface CompletionRateItem {
  date: string;
  created: number;
  completed: number;
}

interface PriorityTrendItem {
  date: string;
  low: number;
  medium: number;
  high: number;
  urgent: number;
}

interface WeeklyWorkloadItem {
  day: string;
  tasks: number;
  hours: number;
}

interface StatusFlowItem {
  date: string;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
}

export interface DashboardStats {
  kpis: DashboardKPIs;
  statusDistribution: DistributionItem[];
  priorityDistribution: DistributionItem[];
  hoursComparison: HoursComparison;
  taskTrend: TrendItem[];
  workloadByAssignee: WorkloadItem[];
  taskTypeDistribution: TaskTypeTrendItem[];
  taskCompletionRate: CompletionRateItem[];
  priorityTrend: PriorityTrendItem[];
  weeklyWorkload: WeeklyWorkloadItem[];
  statusFlow: StatusFlowItem[];
  recentActivity: ActivityItem[];
  upcomingDeadlines: DeadlineItem[];
}

export function useDashboardStats(projectId?: string) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    if (!projectId) {
      setStats(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const cacheKey = `dashboard-stats-${projectId}`;
      const cacheTime = 5000; // 5 seconds cache

      if (!forceRefresh) {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const { data, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < cacheTime) {
            setStats(data);
            setLoading(false);
            return;
          }
        }
      }

      const params = new URLSearchParams();
      params.set('project_id', projectId);

      const response = await apiFetch(`/api/dashboard/stats?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
        
        // Cache the result
        localStorage.setItem(cacheKey, JSON.stringify({
          data: result.data,
          timestamp: Date.now(),
        }));
      } else {
        throw new Error(result.error || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh: () => fetchStats(true),
  };
}
