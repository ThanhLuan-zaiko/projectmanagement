// Expert Time Estimate Repository
import { BaseRepository } from './repository';
import { db } from '@/config';
const { TimeUuid } = require('cassandra-driver').types;

export interface ExpertTimeEstimate extends Record<string, unknown> {
  work_item_id: string;
  project_id: string;
  expert_id: string;
  estimate_id: string;
  estimated_hours: number | null;
  confidence_level: 'low' | 'medium' | 'high' | null;
  estimation_method: 'expert_judgment' | 'planning_poker' | 'three_point' | 'delphi' | null;
  optimistic_hours: number | null;
  most_likely_hours: number | null;
  pessimistic_hours: number | null;
  notes: string | null;
  estimated_at: Date;
  estimated_by: string | null;
  is_deleted: boolean;
  deleted_at: Date | null;
  deleted_by: string | null;
}

export interface ExpertProjectSummary extends Record<string, unknown> {
  project_id: string;
  expert_id: string;
  total_estimated_hours: number | null;
  total_work_items: number | null;
  average_confidence: string | null;
  completed_estimates: number | null;
  created_at: Date;
  updated_at: Date;
  created_by: string | null;
}

export class ExpertEstimateRepository extends BaseRepository<ExpertTimeEstimate> {
  protected tableName = 'expert_time_estimates';
  protected primaryKey = 'estimate_id';

  // Override create to handle composite key
  async create(data: Partial<ExpertTimeEstimate>, options?: any): Promise<ExpertTimeEstimate> {
    const estimate_id = TimeUuid.now().toString();
    const { query, params } = require('@/config').insert(this.tableName, {
      ...data,
      estimate_id,
      estimated_at: new Date(),
      is_deleted: false,
    } as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return data as ExpertTimeEstimate;
  }

  // Override update to handle composite primary key (project_id, work_item_id, expert_id, estimate_id)
  async update(id: string, data: Partial<ExpertTimeEstimate>, options?: any): Promise<ExpertTimeEstimate | null> {
    const { project_id, work_item_id, expert_id, ...restData } = data;
    const projectId = project_id || options?.project_id;
    const workItemId = work_item_id || options?.work_item_id;
    const expertId = expert_id || options?.expert_id;

    if (!projectId || !workItemId || !expertId) {
      throw new Error('project_id, work_item_id, and expert_id are required to update expert estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, expertId, id];

    const { query, params } = require('@/config').update(
      this.tableName,
      restData as Record<string, unknown>,
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return await this.findById(id, { params: [projectId, workItemId, expertId] });
  }

  // Soft delete: mark as deleted instead of removing
  async softDelete(id: string, userId: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;
    const workItemId = options?.work_item_id;
    const expertId = options?.expert_id;

    if (!projectId || !workItemId || !expertId) {
      throw new Error('project_id, work_item_id, and expert_id are required to soft delete expert estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, expertId, id];

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
    const workItemId = options?.work_item_id;
    const expertId = options?.expert_id;

    if (!projectId || !workItemId || !expertId) {
      throw new Error('project_id, work_item_id, and expert_id are required to delete expert estimates');
    }

    const query = 'DELETE FROM expert_time_estimates WHERE project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?';
    const params = [projectId, workItemId, expertId, id];

    await db.execute(query, { ...options, params });
    return true;
  }

  // Restore a soft-deleted estimate
  async restore(id: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;
    const workItemId = options?.work_item_id;
    const expertId = options?.expert_id;

    if (!projectId || !workItemId || !expertId) {
      throw new Error('project_id, work_item_id, and expert_id are required to restore expert estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, expertId, id];

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
  async findById(id: string, options?: { params?: [string, string, string] }): Promise<ExpertTimeEstimate | null> {
    const [projectId, workItemId, expertId] = options?.params || [];
    
    if (!projectId || !workItemId || !expertId) {
      throw new Error('project_id, work_item_id, and expert_id are required in options.params to find expert estimate');
    }

    const query = 'SELECT * FROM expert_time_estimates WHERE project_id = ? AND work_item_id = ? AND expert_id = ? AND estimate_id = ?';
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId, workItemId, expertId, id] });
    return result.rows[0] || null;
  }

  // Find estimates by project
  async findByProjectId(projectId: string, options?: { limit?: number; includeDeleted?: boolean }): Promise<ExpertTimeEstimate[]> {
    const limit = options?.limit ?? 100;
    const includeDeleted = options?.includeDeleted ?? false;
    
    let query = `SELECT * FROM expert_time_estimates WHERE project_id = ?`;
    if (!includeDeleted) {
      query += ` AND is_deleted = false`;
    }
    query += ` LIMIT ${limit}`;
    
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId] });
    return result.rows;
  }

  // Find estimates by work item
  async findByWorkItem(projectId: string, workItemId: string, includeDeleted = false): Promise<ExpertTimeEstimate[]> {
    let query = 'SELECT * FROM expert_time_estimates WHERE project_id = ? AND work_item_id = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId, workItemId] });
    return result.rows;
  }

  // Find estimates by expert
  async findByExpert(expertId: string, includeDeleted = false): Promise<ExpertTimeEstimate[]> {
    let query = 'SELECT * FROM expert_time_estimates WHERE expert_id = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    query += ' ALLOW FILTERING';
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [expertId] });
    return result.rows;
  }

  // Find estimates by confidence level
  async findByConfidence(projectId: string, confidence: string, includeDeleted = false): Promise<ExpertTimeEstimate[]> {
    let query = 'SELECT * FROM expert_time_estimates WHERE project_id = ? AND confidence_level = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId, confidence] });
    return result.rows;
  }

  // Find estimates by estimation method
  async findByMethod(projectId: string, method: string, includeDeleted = false): Promise<ExpertTimeEstimate[]> {
    let query = 'SELECT * FROM expert_time_estimates WHERE project_id = ? AND estimation_method = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId, method] });
    return result.rows;
  }

  // Find deleted estimates (trash)
  async findDeleted(projectId: string): Promise<ExpertTimeEstimate[]> {
    const query = 'SELECT * FROM expert_time_estimates WHERE project_id = ? AND is_deleted = true ALLOW FILTERING';
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId] });
    return result.rows;
  }

  // Get project summary for an expert
  async getProjectSummary(projectId: string, expertId: string): Promise<ExpertProjectSummary | null> {
    const query = 'SELECT * FROM expert_project_summary WHERE project_id = ? AND expert_id = ?';
    const result = await db.execute<ExpertProjectSummary>(query, { params: [projectId, expertId] });
    return result.rows[0] || null;
  }

  // Calculate three-point estimate: (optimistic + 4*most_likely + pessimistic) / 6
  calculateThreePointEstimate(optimistic: number, mostLikely: number, pessimistic: number): number {
    return (optimistic + 4 * mostLikely + pessimistic) / 6;
  }

  // Get all estimates for a work item with expert details
  async getEstimatesForWorkItemWithDetails(
    projectId: string,
    workItemId: string
  ): Promise<(ExpertTimeEstimate & { expert_name?: string })[]> {
    const query = `
      SELECT e.*, ex.name as expert_name 
      FROM expert_time_estimates e
      LEFT JOIN experts ex ON e.expert_id = ex.expert_id
      WHERE e.project_id = ? AND e.work_item_id = ?
    `;
    const result = await db.execute<ExpertTimeEstimate>(query, { params: [projectId, workItemId] });
    return result.rows;
  }

  // Get summary statistics for a project
  async getProjectStatistics(projectId: string): Promise<{
    totalEstimates: number;
    totalHours: number;
    averageConfidence: string;
    estimatesByMethod: Record<string, number>;
    estimatesByConfidence: Record<string, number>;
  }> {
    const estimates = await this.findByProjectId(projectId, { limit: 1000 });

    const stats = {
      totalEstimates: estimates.length,
      totalHours: estimates.reduce((sum, est) => sum + (est.estimated_hours || 0), 0),
      averageConfidence: 'medium',
      estimatesByMethod: {} as Record<string, number>,
      estimatesByConfidence: {} as Record<string, number>,
    };

    // Count by method
    estimates.forEach(est => {
      const method = est.estimation_method || 'unknown';
      stats.estimatesByMethod[method] = (stats.estimatesByMethod[method] || 0) + 1;

      const confidence = est.confidence_level || 'unknown';
      stats.estimatesByConfidence[confidence] = (stats.estimatesByConfidence[confidence] || 0) + 1;
    });

    // Calculate average confidence
    const confidenceScores = { low: 1, medium: 2, high: 3 };
    const totalScore = estimates.reduce((sum, est) => {
      return sum + (confidenceScores[est.confidence_level || 'medium'] || 2);
    }, 0);

    const avgScore = estimates.length > 0 ? totalScore / estimates.length : 2;
    stats.averageConfidence = avgScore < 1.5 ? 'low' : avgScore < 2.5 ? 'medium' : 'high';

    return stats;
  }
}

export const expertEstimateRepository = new ExpertEstimateRepository();
