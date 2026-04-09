// Base repository pattern for data access layer

import { db, QueryOptions, QueryResult, select, insert, update, del } from '@/config';

export abstract class BaseRepository<T extends Record<string, unknown>> {
  protected abstract readonly tableName: string;
  protected abstract readonly primaryKey: string;

  async findById(id: string, options?: QueryOptions): Promise<T | null> {
    const { query, params } = select(this.tableName)
      .where(`${this.primaryKey} = ?`, id)
      .limit(1)
      .build();

    const result = await db.execute<T>(query, { ...options, params });
    return result.rows[0] || null;
  }

  async findByIds(ids: string[], options?: QueryOptions): Promise<T[]> {
    const placeholders = ids.map(() => '?').join(', ');
    const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} IN (${placeholders})`;

    const result = await db.execute<T>(query, { ...options, params: ids });
    return result.rows;
  }

  async findAll(options?: QueryOptions & { limit?: number }): Promise<T[]> {
    const limit = options?.limit ?? 100;
    const { query, params } = select(this.tableName).limit(limit).build();

    const result = await db.execute<T>(query, { ...options, params });
    return result.rows;
  }

  async count(whereClause?: string, whereParams?: unknown[]): Promise<number> {
    const query = `SELECT COUNT(*) FROM ${this.tableName}${whereClause ? ` WHERE ${whereClause}` : ''}`;
    const result = await db.execute<{ count: bigint }>(query, { params: whereParams });

    return result.rows[0]?.count ? Number(result.rows[0].count) : 0;
  }

  async exists(id: string): Promise<boolean> {
    const { query, params } = select(this.tableName, [this.primaryKey])
      .where(`${this.primaryKey} = ?`, id)
      .limit(1)
      .build();

    const result = await db.execute(query, { params });
    return result.rows.length > 0;
  }

  async create(data: Partial<T>, options?: QueryOptions): Promise<T> {
    const { query, params } = insert(this.tableName, {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    } as Record<string, unknown>);

    await db.execute(query, { ...options, params });
    return data as T;
  }

  async update(id: string, data: Partial<T>, options?: QueryOptions): Promise<T | null> {
    const whereClause = `${this.primaryKey} = ?`;
    const whereParams = [id];

    const { query, params } = update(
      this.tableName,
      { ...data, updated_at: new Date() } as Record<string, unknown>,
      whereClause,
      whereParams
    );

    await db.execute(query, { ...options, params });
    return await this.findById(id);
  }

  async delete(id: string, options?: QueryOptions): Promise<boolean> {
    const { query, params } = del(this.tableName, `${this.primaryKey} = ?`, [id]);

    await db.execute(query, { ...options, params });
    return true;
  }

  async executeQuery(query: string, params?: unknown[], options?: QueryOptions): Promise<QueryResult<T>> {
    return db.execute<T>(query, { ...options, params });
  }

  async transaction(operations: Array<{ query: string; params?: unknown[] }>): Promise<void> {
    await db.batch(operations);
  }
}
