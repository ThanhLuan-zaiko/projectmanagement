import { apiFetch } from '@/utils/api-client';
import type { CsvColumn, CsvSection } from '@/utils/csv';
import { buildCsv, downloadCsvFile, sanitizeFilename } from '@/utils/csv';
import type { DashboardStats } from '@/hooks/useDashboardStats';
import type { WorkItem } from '@/types/work-item';
import type { Expert } from '@/types/expert';
import type { ExpertTimeEstimate } from '@/types/expert-estimate';
import type { CostEstimate } from '@/types/cost-estimate';
import type { ProjectSchedule } from '@/types/project-schedule';
import type { WorkItemSchedule } from '@/types/work-schedule';
import type { Project } from '@/types/project';
import { getStatusLabel } from '@/components/projects/project-utils';

interface TeamMemberExportRow {
  member_id: string;
  role: 'owner' | 'manager' | 'member' | 'viewer';
  is_active: boolean;
  joined_at: string;
  full_name?: string;
  email?: string;
}

interface PaginatedApiResponse<T> {
  success: boolean;
  data?: T[];
  error?: string;
  pagination?: {
    page?: number;
    totalPages?: number;
  };
}

function formatDateValue(value?: string | null): string {
  if (!value) {
    return '';
  }

  const parsedDate = new Date(value);

  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return parsedDate.toISOString();
}

function formatNumberValue(value?: number | null): string {
  return typeof value === 'number' ? String(value) : '';
}

export function buildDashboardCsvFilename(projectCode: string | undefined, pageName: string): string {
  const dateStamp = new Date().toISOString().slice(0, 10);
  return sanitizeFilename(`${projectCode || 'project'}-${pageName}-${dateStamp}.csv`);
}

export async function fetchAllPaginatedExportRows<T>(
  endpoint: string,
  params: URLSearchParams,
  pageSize: number = 100
): Promise<T[]> {
  const rows: T[] = [];
  let page = 1;
  let totalPages = 1;

  while (page <= totalPages) {
    const nextParams = new URLSearchParams(params);
    nextParams.set('page', page.toString());
    nextParams.set('limit', pageSize.toString());

    const response = await apiFetch(`${endpoint}?${nextParams.toString()}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to export data from ${endpoint}`);
    }

    const result = (await response.json()) as PaginatedApiResponse<T>;

    if (!result.success) {
      throw new Error(result.error || `Failed to export data from ${endpoint}`);
    }

    const batch = Array.isArray(result.data) ? result.data : [];
    rows.push(...batch);
    totalPages = Math.max(result.pagination?.totalPages ?? 1, 1);
    page += 1;
  }

  return rows;
}

export function exportDashboardCsv<Row>(
  filename: string,
  columns: CsvColumn<Row>[],
  rows: Row[],
  sectionName?: string
): void {
  const sections: CsvSection<Row>[] = [
    {
      name: sectionName,
      columns,
      rows,
    },
  ];

  downloadCsvFile(filename, buildCsv(sections));
}

export const taskCsvColumns: CsvColumn<WorkItem>[] = [
  { header: 'Task ID', value: 'work_item_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'Title', value: 'title' },
  { header: 'Description', value: 'description' },
  { header: 'Type', value: 'work_type' },
  { header: 'Status', value: 'status' },
  { header: 'Priority', value: 'priority' },
  { header: 'Assigned To', value: 'assigned_to' },
  { header: 'Due Date', value: (row) => formatDateValue(row.due_date) },
  { header: 'Estimated Hours', value: (row) => formatNumberValue(row.estimated_hours) },
  { header: 'Actual Hours', value: (row) => formatNumberValue(row.actual_hours) },
  { header: 'Tags', value: (row) => row.tags },
  { header: 'Parent Task ID', value: 'parent_work_item_id' },
  { header: 'Created At', value: (row) => formatDateValue(row.created_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at) },
];

export const expertCsvColumns: CsvColumn<Expert>[] = [
  { header: 'Expert ID', value: 'expert_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'User ID', value: 'user_id' },
  { header: 'Name', value: 'name' },
  { header: 'Email', value: 'email' },
  { header: 'Specialization', value: (row) => row.specialization },
  { header: 'Experience Years', value: (row) => formatNumberValue(row.experience_years) },
  { header: 'Hourly Rate', value: (row) => formatNumberValue(row.hourly_rate) },
  { header: 'Currency', value: 'currency' },
  { header: 'Availability', value: 'availability_status' },
  { header: 'Rating', value: (row) => formatNumberValue(row.rating) },
  { header: 'Is Active', value: 'is_active' },
  { header: 'Created At', value: (row) => formatDateValue(row.created_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at || null) },
];

export const expertEstimateCsvColumns: CsvColumn<ExpertTimeEstimate>[] = [
  { header: 'Estimate ID', value: 'estimate_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'Work Item ID', value: 'work_item_id' },
  { header: 'Work Item Title', value: 'work_item_title' },
  { header: 'Expert ID', value: 'expert_id' },
  { header: 'Expert Name', value: 'expert_name' },
  { header: 'Estimated Hours', value: (row) => formatNumberValue(row.estimated_hours) },
  { header: 'Confidence Level', value: 'confidence_level' },
  { header: 'Estimation Method', value: 'estimation_method' },
  { header: 'Optimistic Hours', value: (row) => formatNumberValue(row.optimistic_hours) },
  { header: 'Most Likely Hours', value: (row) => formatNumberValue(row.most_likely_hours) },
  { header: 'Pessimistic Hours', value: (row) => formatNumberValue(row.pessimistic_hours) },
  { header: 'Notes', value: 'notes' },
  { header: 'Estimated By', value: 'estimated_by' },
  { header: 'Is Deleted', value: 'is_deleted' },
  { header: 'Deleted At', value: (row) => formatDateValue(row.deleted_at) },
  { header: 'Deleted By', value: 'deleted_by' },
  { header: 'Estimated At', value: (row) => formatDateValue(row.estimated_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at || null) },
];

export const costEstimateCsvColumns: CsvColumn<CostEstimate>[] = [
  { header: 'Estimate ID', value: 'estimate_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'Work Item ID', value: 'work_item_id' },
  { header: 'Work Item Title', value: 'work_item_title' },
  { header: 'Estimate Type', value: 'estimate_type' },
  { header: 'Estimated Cost', value: (row) => formatNumberValue(row.estimated_cost) },
  { header: 'Currency', value: 'currency' },
  { header: 'Hourly Rate', value: (row) => formatNumberValue(row.hourly_rate) },
  { header: 'Hours', value: (row) => formatNumberValue(row.hours) },
  { header: 'Quantity', value: (row) => formatNumberValue(row.quantity) },
  { header: 'Unit Cost', value: (row) => formatNumberValue(row.unit_cost) },
  { header: 'Notes', value: 'notes' },
  { header: 'Status', value: 'status' },
  { header: 'Estimated By', value: 'estimated_by' },
  { header: 'Approved At', value: (row) => formatDateValue(row.approved_at) },
  { header: 'Approved By', value: 'approved_by' },
  { header: 'Is Deleted', value: (row) => row.is_deleted ?? false },
  { header: 'Deleted At', value: (row) => formatDateValue(row.deleted_at || null) },
  { header: 'Deleted By', value: 'deleted_by' },
  { header: 'Estimated At', value: (row) => formatDateValue(row.estimated_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at || null) },
];

export const projectScheduleCsvColumns: CsvColumn<ProjectSchedule>[] = [
  { header: 'Schedule ID', value: 'schedule_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'Schedule Name', value: 'schedule_name' },
  { header: 'Schedule Type', value: 'schedule_type' },
  { header: 'Status', value: 'status' },
  { header: 'Start Date', value: (row) => formatDateValue(row.start_date) },
  { header: 'End Date', value: (row) => formatDateValue(row.end_date) },
  { header: 'Planned Duration Days', value: (row) => formatNumberValue(row.planned_duration_days) },
  { header: 'Actual Duration Days', value: (row) => formatNumberValue(row.actual_duration_days) },
  { header: 'Progress Percentage', value: (row) => formatNumberValue(row.progress_percentage) },
  { header: 'Parent Schedule ID', value: 'parent_schedule_id' },
  { header: 'Parent Schedule Name', value: 'parent_schedule_name' },
  { header: 'Created By', value: 'created_by' },
  { header: 'Created By Name', value: 'created_by_name' },
  { header: 'Is Deleted', value: (row) => row.is_deleted ?? false },
  { header: 'Deleted At', value: (row) => formatDateValue(row.deleted_at || null) },
  { header: 'Deleted By', value: 'deleted_by' },
  { header: 'Created At', value: (row) => formatDateValue(row.created_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at) },
];

export const workScheduleCsvColumns: CsvColumn<WorkItemSchedule>[] = [
  { header: 'Work Item ID', value: 'work_item_id' },
  { header: 'Project ID', value: 'project_id' },
  { header: 'Schedule ID', value: 'schedule_id' },
  { header: 'Work Item Title', value: 'work_item_title' },
  { header: 'Schedule Name', value: 'schedule_name' },
  { header: 'Planned Start Date', value: (row) => formatDateValue(row.planned_start_date) },
  { header: 'Planned End Date', value: (row) => formatDateValue(row.planned_end_date) },
  { header: 'Actual Start Date', value: (row) => formatDateValue(row.actual_start_date) },
  { header: 'Actual End Date', value: (row) => formatDateValue(row.actual_end_date) },
  { header: 'Planned Hours', value: (row) => formatNumberValue(row.planned_hours) },
  { header: 'Actual Hours', value: (row) => formatNumberValue(row.actual_hours) },
  { header: 'Dependencies', value: (row) => row.dependencies },
  { header: 'Critical Path', value: 'is_critical_path' },
  { header: 'Status', value: 'status' },
  { header: 'Completion Percentage', value: (row) => formatNumberValue(row.completion_percentage) },
  { header: 'Scheduled By', value: 'scheduled_by' },
  { header: 'Scheduled By Name', value: 'scheduled_by_name' },
  { header: 'Is Deleted', value: (row) => row.is_deleted ?? false },
  { header: 'Deleted At', value: (row) => formatDateValue(row.deleted_at || null) },
  { header: 'Deleted By', value: 'deleted_by' },
  { header: 'Scheduled At', value: (row) => formatDateValue(row.scheduled_at) },
  { header: 'Updated At', value: (row) => formatDateValue(row.updated_at) },
];

export function exportDashboardOverviewCsv(
  filename: string,
  stats: DashboardStats
): void {
  const sections: CsvSection<Record<string, string | number>>[] = [
    {
      name: 'KPI Summary',
      columns: [
        { header: 'Metric', value: 'metric' },
        { header: 'Value', value: 'value' },
        { header: 'Notes', value: 'notes' },
      ],
      rows: [
        { metric: 'Total Tasks', value: stats.kpis.totalTasks, notes: 'All created tasks' },
        { metric: 'In Progress', value: stats.kpis.inProgress, notes: 'Currently active tasks' },
        { metric: 'Completed', value: stats.kpis.completed, notes: 'Finished tasks' },
        { metric: 'Overdue', value: stats.kpis.overdue, notes: 'Tasks past due date' },
        { metric: 'Estimated Hours', value: stats.kpis.totalEstimatedHours, notes: 'Across estimated tasks' },
        { metric: 'Actual Hours', value: stats.kpis.totalActualHours, notes: 'Logged time so far' },
        { metric: 'Tasks With Estimates', value: stats.kpis.tasksWithEstimates, notes: 'Tasks with effort estimates' },
      ],
    },
    {
      name: 'Status Distribution',
      columns: [
        { header: 'Status', value: 'name' },
        { header: 'Count', value: 'count' },
      ],
      rows: stats.statusDistribution.map((item) => ({
        name: item.name,
        count: item.count,
      })),
    },
    {
      name: 'Priority Distribution',
      columns: [
        { header: 'Priority', value: 'name' },
        { header: 'Count', value: 'count' },
      ],
      rows: stats.priorityDistribution.map((item) => ({
        name: item.name,
        count: item.count,
      })),
    },
    {
      name: 'Hours Comparison',
      columns: [
        { header: 'Estimated Hours', value: 'estimated' },
        { header: 'Actual Hours', value: 'actual' },
      ],
      rows: [
        {
          estimated: stats.hoursComparison.estimated,
          actual: stats.hoursComparison.actual,
        },
      ],
    },
    {
      name: 'Task Trend',
      columns: [
        { header: 'Date', value: 'date' },
        { header: 'Count', value: 'count' },
      ],
      rows: stats.taskTrend.map((item) => ({
        date: item.date,
        count: item.count,
      })),
    },
    {
      name: 'Workload By Assignee',
      columns: [
        { header: 'Assignee', value: 'name' },
        { header: 'Task Count', value: 'taskCount' },
        { header: 'Estimated Hours', value: 'estimatedHours' },
      ],
      rows: stats.workloadByAssignee.map((item) => ({
        name: item.name,
        taskCount: item.taskCount,
        estimatedHours: item.estimatedHours,
      })),
    },
    {
      name: 'Task Type Distribution',
      columns: [
        { header: 'Date', value: 'date' },
        { header: 'Task', value: 'task' },
        { header: 'Bug', value: 'bug' },
        { header: 'Milestone', value: 'milestone' },
        { header: 'Subtask', value: 'subtask' },
      ],
      rows: stats.taskTypeDistribution.map((item) => ({
        date: item.date,
        task: item.task,
        bug: item.bug,
        milestone: item.milestone,
        subtask: item.subtask,
      })),
    },
    {
      name: 'Task Completion Rate',
      columns: [
        { header: 'Date', value: 'date' },
        { header: 'Created', value: 'created' },
        { header: 'Completed', value: 'completed' },
      ],
      rows: stats.taskCompletionRate.map((item) => ({
        date: item.date,
        created: item.created,
        completed: item.completed,
      })),
    },
    {
      name: 'Priority Trend',
      columns: [
        { header: 'Date', value: 'date' },
        { header: 'Low', value: 'low' },
        { header: 'Medium', value: 'medium' },
        { header: 'High', value: 'high' },
        { header: 'Urgent', value: 'urgent' },
      ],
      rows: stats.priorityTrend.map((item) => ({
        date: item.date,
        low: item.low,
        medium: item.medium,
        high: item.high,
        urgent: item.urgent,
      })),
    },
    {
      name: 'Weekly Workload',
      columns: [
        { header: 'Day', value: 'day' },
        { header: 'Tasks', value: 'tasks' },
        { header: 'Hours', value: 'hours' },
      ],
      rows: stats.weeklyWorkload.map((item) => ({
        day: item.day,
        tasks: item.tasks,
        hours: item.hours,
      })),
    },
    {
      name: 'Status Flow',
      columns: [
        { header: 'Date', value: 'date' },
        { header: 'To Do', value: 'todo' },
        { header: 'In Progress', value: 'inProgress' },
        { header: 'Review', value: 'review' },
        { header: 'Done', value: 'done' },
      ],
      rows: stats.statusFlow.map((item) => ({
        date: item.date,
        todo: item.todo,
        inProgress: item.inProgress,
        review: item.review,
        done: item.done,
      })),
    },
    {
      name: 'Recent Activity',
      columns: [
        { header: 'Activity ID', value: 'id' },
        { header: 'Title', value: 'title' },
        { header: 'Status', value: 'status' },
        { header: 'Priority', value: 'priority' },
        { header: 'Assigned To', value: 'assigned_to' },
        { header: 'Updated At', value: 'updated_at' },
      ],
      rows: stats.recentActivity.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        assigned_to: item.assigned_to || '',
        updated_at: formatDateValue(String(item.updated_at)),
      })),
    },
    {
      name: 'Upcoming Deadlines',
      columns: [
        { header: 'Task ID', value: 'id' },
        { header: 'Title', value: 'title' },
        { header: 'Status', value: 'status' },
        { header: 'Priority', value: 'priority' },
        { header: 'Due Date', value: 'due_date' },
      ],
      rows: stats.upcomingDeadlines.map((item) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        priority: item.priority,
        due_date: formatDateValue(String(item.due_date)),
      })),
    },
  ];

  downloadCsvFile(filename, buildCsv(sections));
}

export function exportDashboardSettingsCsv(
  filename: string,
  project: Project,
  teamMembers: TeamMemberExportRow[]
): void {
  const sections: CsvSection<Record<string, string | number | boolean>>[] = [
    {
      name: 'Project Settings',
      columns: [
        { header: 'Project ID', value: 'project_id' },
        { header: 'Project Code', value: 'project_code' },
        { header: 'Project Name', value: 'project_name' },
        { header: 'Description', value: 'description' },
        { header: 'Status', value: 'status' },
        { header: 'Status Label', value: 'status_label' },
        { header: 'Currency', value: 'currency' },
        { header: 'Budget', value: 'budget' },
        { header: 'Owner ID', value: 'owner_id' },
        { header: 'Created At', value: 'created_at' },
        { header: 'Updated At', value: 'updated_at' },
      ],
      rows: [
        {
          project_id: project.project_id,
          project_code: project.project_code,
          project_name: project.project_name,
          description: project.description || '',
          status: project.status,
          status_label: getStatusLabel(project.status),
          currency: project.currency,
          budget: project.budget ?? '',
          owner_id: project.owner_id,
          created_at: formatDateValue(project.created_at),
          updated_at: formatDateValue(project.updated_at),
        },
      ],
    },
    {
      name: 'Team Members',
      columns: [
        { header: 'Member ID', value: 'member_id' },
        { header: 'Full Name', value: 'full_name' },
        { header: 'Email', value: 'email' },
        { header: 'Role', value: 'role' },
        { header: 'Is Active', value: 'is_active' },
        { header: 'Joined At', value: 'joined_at' },
      ],
      rows: teamMembers.map((member) => ({
        member_id: member.member_id,
        full_name: member.full_name || '',
        email: member.email || '',
        role: member.role,
        is_active: member.is_active,
        joined_at: formatDateValue(member.joined_at),
      })),
    },
  ];

  downloadCsvFile(filename, buildCsv(sections));
}
