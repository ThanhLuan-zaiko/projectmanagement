// Cost Estimate Repository
import { BaseRepository } from './repository';
import { db } from '@/config';
const { TimeUuid } = require('cassandra-driver').types;

export interface CostEstimate extends Record<string, unknown> {
  work_item_id: string;
  project_id: string;
  estimate_id: string;
  estimate_type: 'labor' | 'material' | 'service' | 'overhead' | 'license';
  estimated_cost: number | null;
  currency: string;
  hourly_rate: number | null;
  hours: number | null;
  quantity: number | null;
  unit_cost: number | null;
  notes: string | null;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  estimated_at: Date;
  estimated_by: string | null;
  approved_at: Date | null;
  approved_by: string | null;
  is_deleted: boolean;
  deleted_at: Date | null;
  deleted_by: string | null;
}

export interface ProjectCostSummary extends Record<string, unknown> {
  project_id: string;
  estimate_type: string;
  total_cost: number | null;
  currency: string;
  labor_cost: number | null;
  material_cost: number | null;
  overhead_cost: number | null;
  license_cost: number | null;
  contingency: number | null;
  calculated_at: Date;
  calculated_by: string | null;
}

export class CostEstimateRepository extends BaseRepository<CostEstimate> {
  protected tableName = 'cost_estimates';
  protected primaryKey = 'estimate_id';

  // Override create to handle composite key
  async create(data: Partial<CostEstimate>, options?: any): Promise<CostEstimate> {
    const estimate_id = TimeUuid.now().toString();
    const { query, params } = require('@/config').insert(this.tableName, {
      ...data,
      estimate_id,
      estimated_at: new Date(),
      is_deleted: false,
    } as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return data as CostEstimate;
  }

  // Override update to handle composite primary key (project_id, work_item_id, estimate_id)
  async update(id: string, data: Partial<CostEstimate>, options?: any): Promise<CostEstimate | null> {
    const { project_id, work_item_id, ...restData } = data;
    const projectId = project_id || options?.project_id;
    const workItemId = work_item_id || options?.work_item_id;

    if (!projectId || !workItemId) {
      throw new Error('project_id and work_item_id are required to update cost estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, id];

    const { query, params } = require('@/config').update(
      this.tableName,
      restData as Record<string, unknown>,
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return await this.findById(id, { params: [projectId, workItemId] });
  }

  // Soft delete: mark as deleted instead of removing
  async softDelete(id: string, userId: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;
    const workItemId = options?.work_item_id;

    if (!projectId || !workItemId) {
      throw new Error('project_id and work_item_id are required to soft delete cost estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, id];

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

    if (!projectId || !workItemId) {
      throw new Error('project_id and work_item_id are required to delete cost estimates');
    }

    const query = 'DELETE FROM cost_estimates WHERE project_id = ? AND work_item_id = ? AND estimate_id = ?';
    const params = [projectId, workItemId, id];

    await db.execute(query, { ...options, params });
    return true;
  }

  // Restore a soft-deleted estimate
  async restore(id: string, options?: any): Promise<boolean> {
    const projectId = options?.project_id;
    const workItemId = options?.work_item_id;

    if (!projectId || !workItemId) {
      throw new Error('project_id and work_item_id are required to restore cost estimates');
    }

    const whereClause = 'project_id = ? AND work_item_id = ? AND estimate_id = ?';
    const whereParams = [projectId, workItemId, id];

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
  async findById(id: string, options?: { params?: [string, string] }): Promise<CostEstimate | null> {
    const [projectId, workItemId] = options?.params || [];

    if (!projectId || !workItemId) {
      throw new Error('project_id and work_item_id are required in options.params to find cost estimate');
    }

    const query = 'SELECT * FROM cost_estimates WHERE project_id = ? AND work_item_id = ? AND estimate_id = ?';
    const result = await db.execute<CostEstimate>(query, { params: [projectId, workItemId, id] });
    return result.rows[0] || null;
  }

  // Find estimates by project
  async findByProjectId(projectId: string, options?: { limit?: number; includeDeleted?: boolean }): Promise<CostEstimate[]> {
    const limit = options?.limit ?? 100;
    const includeDeleted = options?.includeDeleted ?? false;

    let query = `SELECT * FROM cost_estimates WHERE project_id = ?`;
    if (!includeDeleted) {
      query += ` AND is_deleted = false`;
    }
    query += ` LIMIT ${limit}`;

    const result = await db.execute<CostEstimate>(query, { params: [projectId] });
    return result.rows;
  }

  // Find estimates by work item
  async findByWorkItem(projectId: string, workItemId: string, includeDeleted = false): Promise<CostEstimate[]> {
    let query = 'SELECT * FROM cost_estimates WHERE project_id = ? AND work_item_id = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<CostEstimate>(query, { params: [projectId, workItemId] });
    return result.rows;
  }

  // Find estimates by type
  async findByType(projectId: string, estimateType: string, includeDeleted = false): Promise<CostEstimate[]> {
    let query = 'SELECT * FROM cost_estimates WHERE project_id = ? AND estimate_type = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<CostEstimate>(query, { params: [projectId, estimateType] });
    return result.rows;
  }

  // Find estimates by status
  async findByStatus(projectId: string, status: string, includeDeleted = false): Promise<CostEstimate[]> {
    let query = 'SELECT * FROM cost_estimates WHERE project_id = ? AND status = ?';
    if (!includeDeleted) {
      query += ' AND is_deleted = false';
    }
    const result = await db.execute<CostEstimate>(query, { params: [projectId, status] });
    return result.rows;
  }

  // Find deleted estimates (trash)
  async findDeleted(projectId: string): Promise<CostEstimate[]> {
    const query = 'SELECT * FROM cost_estimates WHERE project_id = ? AND is_deleted = true ALLOW FILTERING';
    const result = await db.execute<CostEstimate>(query, { params: [projectId] });
    return result.rows;
  }

  // Get project cost summary
  async getProjectSummary(projectId: string): Promise<ProjectCostSummary[]> {
    const query = 'SELECT * FROM project_cost_summary WHERE project_id = ?';
    const result = await db.execute<ProjectCostSummary>(query, { params: [projectId] });
    return result.rows;
  }

  // Calculate total estimated cost for a work item
  async getTotalForWorkItem(projectId: string, workItemId: string): Promise<number> {
    const query = 'SELECT estimated_cost FROM cost_estimates WHERE project_id = ? AND work_item_id = ? AND is_deleted = false';
    const result = await db.execute<CostEstimate>(query, { params: [projectId, workItemId] });
    
    return result.rows.reduce((sum, estimate) => sum + (estimate.estimated_cost || 0), 0);
  }

  // Get summary statistics for a project
  async getProjectStatistics(projectId: string): Promise<{
    totalEstimates: number;
    totalCost: number;
    estimatesByType: Record<string, number>;
    estimatesByStatus: Record<string, number>;
  }> {
    const estimates = await this.findByProjectId(projectId, { limit: 1000 });

    const stats = {
      totalEstimates: estimates.length,
      totalCost: estimates.reduce((sum, est) => sum + (est.estimated_cost || 0), 0),
      estimatesByType: {} as Record<string, number>,
      estimatesByStatus: {} as Record<string, number>,
    };

    // Count by type and status
    estimates.forEach(est => {
      const type = est.estimate_type || 'unknown';
      stats.estimatesByType[type] = (stats.estimatesByType[type] || 0) + 1;

      const status = est.status || 'unknown';
      stats.estimatesByStatus[status] = (stats.estimatesByStatus[status] || 0) + 1;
    });

    return stats;
  }
}

export const costEstimateRepository = new CostEstimateRepository();
