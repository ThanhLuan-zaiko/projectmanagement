// Expert Repository
import { BaseRepository } from './repository';
import { db } from '@/config';

export interface Expert extends Record<string, unknown> {
  expert_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  specialization: string[] | null;
  experience_years: number | null;
  hourly_rate: number | null;
  currency: string | null;
  availability_status: 'available' | 'busy' | 'unavailable' | null;
  rating: number | null;
  is_active: boolean | null;
  created_at: Date;
}

export class ExpertRepository extends BaseRepository<Expert> {
  protected tableName = 'experts';
  protected primaryKey = 'expert_id';

  // Find all active experts
  async findActive(): Promise<Expert[]> {
    const query = 'SELECT * FROM experts LIMIT 1000';
    const result = await db.execute<Expert>(query, { params: [] });
    return result.rows.filter(e => e.is_active === true);
  }

  // Find experts by availability status
  async findByAvailability(status: string): Promise<Expert[]> {
    const query = 'SELECT * FROM experts LIMIT 1000';
    const result = await db.execute<Expert>(query, { params: [] });
    return result.rows.filter(e => e.availability_status === status);
  }

  // Find expert by user_id
  async findByUserId(userId: string): Promise<Expert | null> {
    const query = 'SELECT * FROM experts LIMIT 1000';
    const result = await db.execute<Expert>(query, { params: [] });
    return result.rows.find(e => e.user_id === userId) || null;
  }

  // Search experts by name or specialization
  async search(searchTerm: string): Promise<Expert[]> {
    const query = 'SELECT * FROM experts LIMIT 1000';
    const result = await db.execute<Expert>(query, { params: [] });

    return result.rows.filter(expert =>
      expert.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expert.specialization?.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Get all experts with optional filters
  async findAllWithOptions(options?: {
    isActive?: boolean;
    availabilityStatus?: string;
    limit?: number;
  }): Promise<Expert[]> {
    const { isActive, availabilityStatus, limit = 1000 } = options || {};

    // Simple query without WHERE to avoid ScyllaDB filtering issues
    const query = 'SELECT * FROM experts LIMIT ?';
    const result = await db.execute<Expert>(query, { params: [limit] });

    // Client-side filtering
    let experts = result.rows;
    if (isActive !== undefined) {
      experts = experts.filter(e => e.is_active === isActive);
    }
    if (availabilityStatus) {
      experts = experts.filter(e => e.availability_status === availabilityStatus);
    }

    return experts;
  }

  // Find experts by project_id using the association table
  async findByProjectId(projectId: string, options?: { limit?: number; isActive?: boolean }): Promise<Expert[]> {
    // 1. Get associated expert IDs for this project
    const associationQuery = 'SELECT expert_id FROM expert_project_summary WHERE project_id = ?';
    const associationResult = await db.execute<{ expert_id: any }>(associationQuery, { params: [projectId] });
    
    if (associationResult.rows.length === 0) return [];
    
    const expertIds = associationResult.rows.map(r => r.expert_id);
    
    // 2. Fetch expert details using an IN query on the partition key (expert_id)
    const placeholders = expertIds.map(() => '?').join(',');
    const query = `SELECT * FROM experts WHERE expert_id IN (${placeholders})`;
    const result = await db.execute<Expert>(query, { params: expertIds });
    
    let experts = result.rows;
    
    // 3. Apply status filter in JS (consistent with Tasks pattern)
    if (options?.isActive !== undefined) {
      experts = experts.filter(e => e.is_active === options.isActive);
    }
    
    return experts;
  }

  // Delete expert permanently from database
  async permanentDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM experts WHERE expert_id = ?';
    await db.execute(query, { params: [id] });
    return true;
  }
}

export const expertRepository = new ExpertRepository();
