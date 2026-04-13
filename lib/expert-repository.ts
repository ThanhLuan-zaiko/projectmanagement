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

  // Delete expert permanently from database
  async permanentDelete(id: string): Promise<boolean> {
    const query = 'DELETE FROM experts WHERE expert_id = ?';
    await db.execute(query, { params: [id] });
    return true;
  }
}

export const expertRepository = new ExpertRepository();
