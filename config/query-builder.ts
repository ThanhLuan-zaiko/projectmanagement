// Query builder helper for constructing CQL queries safely

export class QueryBuilder {
  private parts: string[] = [];
  private params: unknown[] = [];
  private paramIndex = 0;

  constructor(baseQuery: string = '') {
    if (baseQuery) {
      this.parts.push(baseQuery);
    }
  }

  append(sql: string): QueryBuilder {
    this.parts.push(sql);
    return this;
  }

  where(condition: string, value?: unknown): QueryBuilder {
    this.parts.push(this.parts.some(p => p.toLowerCase().includes('where')) ? 'AND' : 'WHERE');
    this.parts.push(condition);

    if (value !== undefined) {
      this.params.push(value);
    }

    return this;
  }

  andWhere(condition: string, value?: unknown): QueryBuilder {
    this.parts.push('AND');
    this.parts.push(condition);

    if (value !== undefined) {
      this.params.push(value);
    }

    return this;
  }

  orderBy(column: string, direction: 'ASC' | 'DESC' = 'ASC'): QueryBuilder {
    this.parts.push('ORDER BY');
    this.parts.push(`${column} ${direction}`);
    return this;
  }

  limit(count: number): QueryBuilder {
    this.parts.push('LIMIT');
    this.parts.push(count.toString());
    return this;
  }

  allowFiltering(): QueryBuilder {
    this.parts.push('ALLOW FILTERING');
    return this;
  }

  addParam(value: unknown): number {
    this.params.push(value);
    return this.paramIndex++;
  }

  getQuery(): string {
    return this.parts.join(' ');
  }

  getParams(): unknown[] {
    return this.params;
  }

  build(): { query: string; params: unknown[] } {
    return {
      query: this.getQuery(),
      params: this.getParams(),
    };
  }

  toString(): string {
    return this.getQuery();
  }
}

// Helper functions for common CQL patterns
export function insert(table: string, data: Record<string, unknown>): { query: string; params: unknown[] } {
  const columns = Object.keys(data);
  const placeholders = columns.map((_, i) => `?`).join(', ');
  const params = columns.map(col => data[col]);

  return {
    query: `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
    params,
  };
}

export function update(
  table: string,
  data: Record<string, unknown>,
  whereClause: string,
  whereParams: unknown[] = []
): { query: string; params: unknown[] } {
  const setClauses = Object.keys(data).map(col => `${col} = ?`);
  const params = [...Object.values(data), ...whereParams];

  return {
    query: `UPDATE ${table} SET ${setClauses.join(', ')} WHERE ${whereClause}`,
    params,
  };
}

export function select(
  table: string,
  columns: string[] = ['*']
): QueryBuilder {
  return new QueryBuilder(`SELECT ${columns.join(', ')} FROM ${table}`);
}

export function del(table: string, whereClause: string, whereParams: unknown[] = []): { query: string; params: unknown[] } {
  return {
    query: `DELETE FROM ${table} WHERE ${whereClause}`,
    params: whereParams,
  };
}
