// Schedule Assignment Repository
import { BaseRepository } from './repository';
import { db } from '@/config';
const { TimeUuid } = require('cassandra-driver').types;

export interface ScheduleAssignment extends Record<string, unknown> {
  schedule_id: string;
  project_id: string;
  work_item_id: string;
  assigned_to: string;
  assignment_id: string;
  role: string | null;
  allocated_hours: number | null;
  assigned_at: Date;
  assigned_by: string | null;
}

export class ScheduleAssignmentRepository extends BaseRepository<ScheduleAssignment> {
  protected tableName = 'schedule_assignments';
  protected primaryKey = 'assignment_id';

  // Override create to handle composite key
  async create(data: Partial<ScheduleAssignment>, options?: any): Promise<ScheduleAssignment> {
    const assignment_id = TimeUuid.now().toString();
    const { query, params } = require('@/config').insert(this.tableName, {
      ...data,
      assignment_id,
      assigned_at: new Date(),
    } as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return data as ScheduleAssignment;
  }

  // Find assignments by work item
  async findByWorkItem(projectId: string, workItemId: string): Promise<ScheduleAssignment[]> {
    const query = 'SELECT * FROM schedule_assignments WHERE project_id = ? AND work_item_id = ?';
    const result = await db.execute<ScheduleAssignment>(query, { params: [projectId, workItemId] });
    return result.rows;
  }

  // Find assignments by user
  async findByUserId(userId: string): Promise<ScheduleAssignment[]> {
    const query = 'SELECT * FROM schedule_assignments WHERE assigned_to = ? ALLOW FILTERING';
    const result = await db.execute<ScheduleAssignment>(query, { params: [userId] });
    return result.rows;
  }

  // Find assignments by schedule
  async findByScheduleId(projectId: string, scheduleId: string): Promise<ScheduleAssignment[]> {
    const query = 'SELECT * FROM schedule_assignments WHERE project_id = ? AND schedule_id = ?';
    const result = await db.execute<ScheduleAssignment>(query, { params: [projectId, scheduleId] });
    return result.rows;
  }

  // Delete assignment
  async deleteAssignment(id: string, options?: any): Promise<boolean> {
    const { query, params } = require('@/config').del(this.tableName, 'assignment_id = ?', [id]);
    await db.execute(query, { ...options, params });
    return true;
  }
}

export const scheduleAssignmentRepository = new ScheduleAssignmentRepository();
