// Work Item Schedule Repository
import { BaseRepository } from './repository';
import { db } from '@/config';
const { TimeUuid } = require('cassandra-driver').types;

export interface WorkItemSchedule extends Record<string, unknown> {
  work_item_id: string;
  project_id: string;
  schedule_id: string | null;
  planned_start_date: Date;
  planned_end_date: Date;
  actual_start_date: Date | null;
  actual_end_date: Date | null;
  planned_hours: number | null;
  actual_hours: number | null;
  dependencies: string[];
  is_critical_path: boolean;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed' | 'blocked';
  completion_percentage: number | null;
  scheduled_by: string | null;
  scheduled_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_at: Date | null;
  deleted_by: string | null;
}

export class WorkScheduleRepository extends BaseRepository<WorkItemSchedule> {
  protected tableName = 'work_item_schedules';
  protected primaryKey = 'work_item_id';

  // Override create to handle composite key
  async create(data: Partial<WorkItemSchedule>, options?: any): Promise<WorkItemSchedule> {
    const scheduleData = {
      ...data,
      scheduled_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
      dependencies: data.dependencies || [],
      is_critical_path: data.is_critical_path || false,
    };

    const { query, params } = require('@/config').insert(this.tableName, scheduleData as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return scheduleData as WorkItemSchedule;
  }

  // Override update to handle composite primary key (project_id, work_item_id)
  async update(id: string, data: Partial<WorkItemSchedule>, options?: any): Promise<WorkItemSchedule | null> {
    const { project_id, work_item_id, ...restData } = data;
    const projectId = project_id || options?.project_id;
    const workItemId = work_item_id || id;

    if (!projectId) {
      throw new Error('project_id is required to update work schedules');
    }

    const whereClause = 'project_id = ? AND work_item_id = ?';
    const whereParams = [projectId, workItemId];

    const { query, params } = require('@/config').update(
      this.tableName,
      { ...restData, updated_at: new Date() } as Record<string, unknown>,
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return await this.findById(workItemId, { params: [projectId] });
  }

  // Soft delete: mark as deleted instead of removing
  async softDelete(id: string, userId: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to soft delete work schedules');
    }

    const whereClause = 'project_id = ? AND work_item_id = ?';
    const whereParams = [projectId, id];

    const { query, params } = require('@/config').update(
      this.tableName,
      { is_deleted: true, deleted_at: new Date(), deleted_by: userId },
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return true;
  }

  // Hard delete: permanently remove from database
  async hardDelete(id: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to delete work schedules');
    }

    const query = 'DELETE FROM work_item_schedules WHERE project_id = ? AND work_item_id = ?';
    const params = [projectId, id];

    await db.execute(query, { ...options, params });
    return true;
  }

  // Restore a soft-deleted schedule
  async restore(id: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to restore work schedules');
    }

    const whereClause = 'project_id = ? AND work_item_id = ?';
    const whereParams = [projectId, id];

    const { query, params } = require('@/config').update(
      this.tableName,
      { is_deleted: false, deleted_at: null, deleted_by: null },
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return true;
  }

  // Override findById to handle composite key
  async findById(id: string, options?: { params?: [string] }): Promise<WorkItemSchedule | null> {
    const [projectId] = options?.params || [];

    if (!projectId) {
      throw new Error('project_id is required in options.params to find work schedule');
    }

    const query = 'SELECT * FROM work_item_schedules WHERE project_id = ? AND work_item_id = ?';
    const result = await db.execute<WorkItemSchedule>(query, { params: [projectId, id] });
    return result.rows[0] || null;
  }

  // Find schedules by project
  async findByProjectId(projectId: string, options?: { limit?: number; includeDeleted?: boolean }): Promise<WorkItemSchedule[]> {
    const limit = options?.limit ?? 100;
    const includeDeleted = options?.includeDeleted ?? false;

    const query = `SELECT * FROM work_item_schedules WHERE project_id = ? LIMIT ${limit}`;
    const result = await db.execute<WorkItemSchedule>(query, { params: [projectId] });
    
    // Client-side filtering for consistency with Tasks pattern
    let schedules = result.rows;
    if (!includeDeleted) {
      schedules = schedules.filter(s => s.is_deleted === false || s.is_deleted === null);
    }
    
    return schedules;
  }

  // Find schedules by status
  async findByStatus(projectId: string, status: string, includeDeleted = false): Promise<WorkItemSchedule[]> {
    const schedules = await this.findByProjectId(projectId, { includeDeleted, limit: 1000 });
    return schedules.filter(s => s.status === status);
  }

  // Find schedules by schedule_id (project schedule)
  async findByScheduleId(projectId: string, scheduleId: string, includeDeleted = false): Promise<WorkItemSchedule[]> {
    const schedules = await this.findByProjectId(projectId, { includeDeleted, limit: 1000 });
    return schedules.filter(s => String(s.schedule_id) === scheduleId);
  }

  // Find critical path items
  async findCriticalPath(projectId: string, includeDeleted = false): Promise<WorkItemSchedule[]> {
    const schedules = await this.findByProjectId(projectId, { includeDeleted, limit: 1000 });
    return schedules.filter(s => s.is_critical_path === true);
  }

  // Find deleted schedules (trash)
  async findDeleted(projectId: string): Promise<WorkItemSchedule[]> {
    const schedules = await this.findByProjectId(projectId, { includeDeleted: true, limit: 1000 });
    return schedules.filter(s => s.is_deleted === true);
  }

  // Get summary statistics for a project
  async getProjectStatistics(projectId: string): Promise<{
    totalSchedules: number;
    schedulesByStatus: Record<string, number>;
    averageCompletion: number;
    criticalPathCount: number;
  }> {
    const schedules = await this.findByProjectId(projectId, { limit: 1000 });

    const stats = {
      totalSchedules: schedules.length,
      schedulesByStatus: {} as Record<string, number>,
      averageCompletion: 0,
      criticalPathCount: 0,
    };

    // Count by status
    let totalCompletion = 0;
    let completionCount = 0;
    
    schedules.forEach(schedule => {
      const status = schedule.status || 'unknown';
      stats.schedulesByStatus[status] = (stats.schedulesByStatus[status] || 0) + 1;

      if (schedule.completion_percentage !== null) {
        totalCompletion += Number(schedule.completion_percentage);
        completionCount++;
      }

      if (schedule.is_critical_path) {
        stats.criticalPathCount++;
      }
    });

    stats.averageCompletion = completionCount > 0 ? totalCompletion / completionCount : 0;

    return stats;
  }
}

export const workScheduleRepository = new WorkScheduleRepository();
