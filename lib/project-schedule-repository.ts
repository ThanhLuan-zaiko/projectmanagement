// Project Schedule Repository
import { BaseRepository } from './repository';
import { db } from '@/config';
const { TimeUuid } = require('cassandra-driver').types;

export interface ProjectSchedule extends Record<string, unknown> {
  schedule_id: string;
  project_id: string;
  schedule_name: string;
  schedule_type: 'phase' | 'milestone' | 'sprint' | 'release';
  start_date: Date;
  end_date: Date;
  planned_duration_days: number | null;
  actual_duration_days: number | null;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  progress_percentage: number | null;
  parent_schedule_id: string | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
  is_deleted: boolean;
  deleted_at: Date | null;
  deleted_by: string | null;
}

export class ProjectScheduleRepository extends BaseRepository<ProjectSchedule> {
  protected tableName = 'project_schedules';
  protected primaryKey = 'schedule_id';

  // Override create to handle composite key
  async create(data: Partial<ProjectSchedule>, options?: any): Promise<ProjectSchedule> {
    const schedule_id = TimeUuid.now().toString();
    
    // Calculate duration if dates are provided
    let plannedDurationDays = data.planned_duration_days;
    if (data.start_date && data.end_date && !plannedDurationDays) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      plannedDurationDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const { query, params } = require('@/config').insert(this.tableName, {
      ...data,
      schedule_id,
      planned_duration_days: plannedDurationDays,
      created_at: new Date(),
      updated_at: new Date(),
      is_deleted: false,
    } as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return data as ProjectSchedule;
  }

  // Override update to handle composite primary key (project_id, schedule_id)
  async update(id: string, data: Partial<ProjectSchedule>, options?: any): Promise<ProjectSchedule | null> {
    const { project_id, ...restData } = data;
    const projectId = project_id || options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to update project schedules');
    }

    // Calculate duration if dates are provided
    if (data.start_date && data.end_date) {
      const startDate = new Date(data.start_date);
      const endDate = new Date(data.end_date);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      restData.planned_duration_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    const whereClause = 'project_id = ? AND schedule_id = ?';
    const whereParams = [projectId, id];

    const { query, params } = require('@/config').update(
      this.tableName,
      { ...restData, updated_at: new Date() } as Record<string, unknown>,
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return await this.findById(id, { params: [projectId] });
  }

  // Soft delete: mark as deleted instead of removing
  async softDelete(id: string, userId: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to soft delete project schedules');
    }

    const whereClause = 'project_id = ? AND schedule_id = ?';
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
      throw new Error('project_id is required to delete project schedules');
    }

    const query = 'DELETE FROM project_schedules WHERE project_id = ? AND schedule_id = ?';
    const params = [projectId, id];

    await db.execute(query, { ...options, params });
    return true;
  }

  // Restore a soft-deleted schedule
  async restore(id: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to restore project schedules');
    }

    const whereClause = 'project_id = ? AND schedule_id = ?';
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
  async findById(id: string, options?: { params?: [string] }): Promise<ProjectSchedule | null> {
    const [projectId] = options?.params || [];

    if (!projectId) {
      throw new Error('project_id is required in options.params to find project schedule');
    }

    const query = 'SELECT * FROM project_schedules WHERE project_id = ? AND schedule_id = ?';
    const result = await db.execute<ProjectSchedule>(query, { params: [projectId, id] });
    return result.rows[0] || null;
  }

  // Find schedules by project
  async findByProjectId(projectId: string, options?: { limit?: number; includeDeleted?: boolean }): Promise<ProjectSchedule[]> {
    const limit = options?.limit ?? 100;
    const includeDeleted = options?.includeDeleted ?? false;

    let query = `SELECT * FROM project_schedules WHERE project_id = ?`;
    if (!includeDeleted) {
      query += ` AND is_deleted = false`;
    }
    query += ` LIMIT ${limit}`;

    const result = await db.execute<ProjectSchedule>(query, { params: [projectId] });
    return result.rows;
  }

  // Find schedules by type
  async findByType(projectId: string, scheduleType: string, includeDeleted = false): Promise<ProjectSchedule[]> {
    let query = 'SELECT * FROM project_schedules WHERE project_id = ? AND schedule_type = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ProjectSchedule>(query, { params: [projectId, scheduleType] });
    return result.rows;
  }

  // Find schedules by status
  async findByStatus(projectId: string, status: string, includeDeleted = false): Promise<ProjectSchedule[]> {
    let query = 'SELECT * FROM project_schedules WHERE project_id = ? AND status = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ProjectSchedule>(query, { params: [projectId, status] });
    return result.rows;
  }

  // Find schedules by parent
  async findByParentScheduleId(projectId: string, parentScheduleId: string, includeDeleted = false): Promise<ProjectSchedule[]> {
    let query = 'SELECT * FROM project_schedules WHERE project_id = ? AND parent_schedule_id = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ProjectSchedule>(query, { params: [projectId, parentScheduleId] });
    return result.rows;
  }

  // Find deleted schedules (trash)
  async findDeleted(projectId: string): Promise<ProjectSchedule[]> {
    const query = 'SELECT * FROM project_schedules WHERE project_id = ? AND is_deleted = true ALLOW FILTERING';
    const result = await db.execute<ProjectSchedule>(query, { params: [projectId] });
    return result.rows;
  }

  // Get summary statistics for a project
  async getProjectStatistics(projectId: string): Promise<{
    totalSchedules: number;
    schedulesByType: Record<string, number>;
    schedulesByStatus: Record<string, number>;
    averageProgress: number;
  }> {
    const schedules = await this.findByProjectId(projectId, { limit: 1000 });

    const stats = {
      totalSchedules: schedules.length,
      schedulesByType: {} as Record<string, number>,
      schedulesByStatus: {} as Record<string, number>,
      averageProgress: 0,
    };

    // Count by type and status
    let totalProgress = 0;
    let progressCount = 0;
    
    schedules.forEach(schedule => {
      const type = schedule.schedule_type || 'unknown';
      stats.schedulesByType[type] = (stats.schedulesByType[type] || 0) + 1;

      const status = schedule.status || 'unknown';
      stats.schedulesByStatus[status] = (stats.schedulesByStatus[status] || 0) + 1;

      if (schedule.progress_percentage !== null) {
        totalProgress += schedule.progress_percentage;
        progressCount++;
      }
    });

    stats.averageProgress = progressCount > 0 ? totalProgress / progressCount : 0;

    return stats;
  }
}

export const projectScheduleRepository = new ProjectScheduleRepository();
