'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProject } from '@/app/[projectCode]/layout';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { FiLoader, FiAlertCircle, FiClipboard, FiCheckCircle, FiClock, FiAlertTriangle, FiBarChart2 } from 'react-icons/fi';
import {
  TaskCreateModal,
  DashboardKPI,
  TaskStatusChart,
  TaskPriorityChart,
  TaskTrendChart,
  HoursComparisonChart,
  ActivityList,
  UpcomingDeadlines,
  DashboardTabs,
  WorkloadByAssigneeChart,
  TaskTypeDistributionChart,
  TaskCompletionRateChart,
  PriorityTrendChart,
  WeeklyWorkloadChart,
  StatusFlowChart,
} from '@/components/dashboard';
import { DashboardHeader } from '@/components/layout';

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* KPI Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 animate-pulse">
            <div className="h-4 bg-slate-700 rounded w-1/2 mb-3" />
            <div className="h-8 bg-slate-700/50 rounded w-3/4 mb-2" />
            <div className="h-3 bg-slate-700/30 rounded w-1/3" />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 rounded-xl sm:rounded-2xl p-6 animate-pulse">
            <div className="h-5 bg-slate-700 rounded w-1/3 mb-4" />
            <div className="h-64 bg-slate-700/30 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProjectDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { project } = useProject();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch dashboard stats
  const { stats, loading: statsLoading } = useDashboardStats(project?.project_id);

  // Handler for create task button
  const handleCreate = () => {
    setShowCreateModal(true);
  };

  // Show minimal loading on initial mount (very fast)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-4 animate-pulse">
            <FiClipboard className="w-8 h-8 text-white" />
          </div>
          <FiLoader className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Not authenticated - redirect handled by AuthProvider
  if (!user) {
    return null;
  }

  return (
    <>
      <DashboardHeader
        title={project?.project_name || 'Dashboard'}
        subtitle={`Project: ${project?.project_code}`}
        actionLabel="Create Task"
        onAction={handleCreate}
      />
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Tab Navigation */}
        <DashboardTabs />

        {/* Overview Content */}
        <div id="overview-panel" role="tabpanel" aria-labelledby="overview-tab">
          {statsLoading ? (
            <DashboardSkeleton />
          ) : stats ? (
            <div className="space-y-6 sm:space-y-8">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <DashboardKPI
                  title="Total Tasks"
                  value={stats.kpis.totalTasks}
                  subtitle="All created tasks"
                  icon={FiClipboard}
                  color="blue"
                />
                <DashboardKPI
                  title="In Progress"
                  value={stats.kpis.inProgress}
                  subtitle={`${stats.kpis.totalTasks > 0 ? ((stats.kpis.inProgress / stats.kpis.totalTasks) * 100).toFixed(1) : 0}% of total`}
                  icon={FiBarChart2}
                  color="yellow"
                />
                <DashboardKPI
                  title="Completed"
                  value={stats.kpis.completed}
                  subtitle={`${stats.kpis.totalTasks > 0 ? ((stats.kpis.completed / stats.kpis.totalTasks) * 100).toFixed(1) : 0}% completion rate`}
                  icon={FiCheckCircle}
                  color="green"
                />
                <DashboardKPI
                  title="Overdue"
                  value={stats.kpis.overdue}
                  subtitle="Tasks past due date"
                  icon={FiAlertTriangle}
                  color="red"
                />
              </div>

              {/* Hours KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <DashboardKPI
                  title="Estimated Hours"
                  value={`${stats.kpis.totalEstimatedHours}h`}
                  subtitle={`${stats.kpis.tasksWithEstimates} tasks with estimates`}
                  icon={FiClock}
                  color="purple"
                />
                <DashboardKPI
                  title="Actual Hours"
                  value={`${stats.kpis.totalActualHours}h`}
                  subtitle="Time spent on tasks"
                  icon={FiClock}
                  color="purple"
                />
                <DashboardKPI
                  title="Hours Variance"
                  value={`${(parseFloat(stats.kpis.totalActualHours) - parseFloat(stats.kpis.totalEstimatedHours)).toFixed(1)}h`}
                  subtitle={
                    parseFloat(stats.kpis.totalActualHours) > parseFloat(stats.kpis.totalEstimatedHours)
                      ? 'Over budget'
                      : 'Under budget'
                  }
                  icon={FiAlertCircle}
                  color={
                    parseFloat(stats.kpis.totalActualHours) > parseFloat(stats.kpis.totalEstimatedHours)
                      ? 'red'
                      : 'green'
                  }
                />
              </div>

              {/* Charts Row 1: Status + Priority */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TaskStatusChart data={stats.statusDistribution} />
                <TaskPriorityChart data={stats.priorityDistribution} />
              </div>

              {/* Charts Row 2: Trend + Hours Comparison */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TaskTrendChart data={stats.taskTrend} />
                <HoursComparisonChart
                  estimated={stats.hoursComparison.estimated}
                  actual={stats.hoursComparison.actual}
                />
              </div>

              {/* Charts Row 3: Task Type Distribution (Area) + Priority Trend (Stacked Area) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TaskTypeDistributionChart data={stats.taskTypeDistribution} />
                <PriorityTrendChart data={stats.priorityTrend} />
              </div>

              {/* Charts Row 4: Completion Rate + Status Flow */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <TaskCompletionRateChart data={stats.taskCompletionRate} />
                <StatusFlowChart data={stats.statusFlow} />
              </div>

              {/* Charts Row 5: Workload + Weekly Pattern */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <WorkloadByAssigneeChart data={stats.workloadByAssignee} />
                <WeeklyWorkloadChart data={stats.weeklyWorkload} />
              </div>

              {/* Activity + Deadlines */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <ActivityList activities={stats.recentActivity} />
                <UpcomingDeadlines deadlines={stats.upcomingDeadlines} />
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <FiAlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">Failed to load dashboard statistics</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      <TaskCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        editingItem={null}
        formData={{
          title: '',
          description: '',
          work_type: 'task',
          status: 'todo',
          priority: 'medium',
          assigned_to: '',
          due_date: '',
          estimated_hours: '',
          tags: '',
          project_id: project?.project_id || '',
        }}
        isSubmitting={false}
        onSubmit={async () => {}}
        onChange={() => {}}
        onReset={() => {}}
        validationErrors={[]}
      />
    </>
  );
}
