// Expert Repository
import { BaseRepository } from './repository';
import { db, insert, update, type QueryOptions } from '@/config';

type ExpertMutationOptions = QueryOptions & {
  project_id?: string;
};

export interface Expert extends Record<string, unknown> {
  project_id: string;
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
  updated_at: Date;
}

export class ExpertRepository extends BaseRepository<Expert> {
  protected tableName = 'experts';
  protected primaryKey = 'expert_id';

  async create(data: Partial<Expert>, options?: QueryOptions): Promise<Expert> {
    if (!data.project_id) {
      throw new Error('project_id is required to create experts');
    }

    const expertData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: data.is_active ?? true,
    };

    const { query, params } = insert(this.tableName, expertData as Record<string, unknown>);
    await db.execute(query, { ...options, params });
    return expertData as Expert;
  }

  async update(id: string, data: Partial<Expert>, options?: ExpertMutationOptions): Promise<Expert | null> {
    const { project_id, ...restData } = data;
    const projectId = project_id || options?.project_id;

    if (!projectId) {
      throw new Error('project_id is required to update experts');
    }

    const { query, params } = update(
      this.tableName,
      {
        ...restData,
        updated_at: new Date(),
      } as Record<string, unknown>,
      'project_id = ? AND expert_id = ?',
      [projectId, id]
    );

    await db.execute(query, { ...options, params });
    return this.findById(id, { params: [projectId] });
  }

  async findById(id: string, options?: { params?: [string] }): Promise<Expert | null> {
    const [projectId] = options?.params || [];

    if (!projectId) {
      throw new Error('project_id is required in options.params to find expert');
    }

    const query = 'SELECT * FROM experts WHERE project_id = ? AND expert_id = ?';
    const result = await db.execute<Expert>(query, { params: [projectId, id] });
    return result.rows[0] || null;
  }

  async findActive(projectId: string): Promise<Expert[]> {
    const experts = await this.findByProjectId(projectId, { limit: 1000, isActive: true });
    return experts.filter((expert) => expert.is_active === true);
  }

  async findByUserId(projectId: string, userId: string): Promise<Expert | null> {
    const experts = await this.findByProjectId(projectId, { limit: 1000 });
    return experts.find((expert) => expert.user_id === userId) || null;
  }

  async findByProjectId(projectId: string, options?: { limit?: number; isActive?: boolean }): Promise<Expert[]> {
    const limit = options?.limit ?? 1000;
    const query = `SELECT * FROM experts WHERE project_id = ? LIMIT ${limit}`;
    const result = await db.execute<Expert>(query, { params: [projectId] });
    let experts = result.rows;

    if (options?.isActive !== undefined) {
      experts = experts.filter((expert) => expert.is_active === options.isActive);
    }

    return experts;
  }

  async permanentDelete(id: string, projectId: string): Promise<boolean> {
    const query = 'DELETE FROM experts WHERE project_id = ? AND expert_id = ?';
    await db.execute(query, { params: [projectId, id] });
    return true;
  }
}

export const expertRepository = new ExpertRepository();
