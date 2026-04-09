// ScyllaDB Client with connection pooling and lifecycle management

import cassandra from 'cassandra-driver';
import type cassandraDriver from 'cassandra-driver';
import { config } from './env';
import { ConnectionError, QueryError, TimeoutError } from './errors';

type Client = cassandraDriver.Client;

export interface QueryOptions {
  params?: unknown[];
  prepare?: boolean;
  fetchSize?: number;
  pageState?: string;
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[];
  rowLength: number;
  pageState?: string;
  wasApplied(): boolean;
}

class ScyllaDBClient {
  private static instance: ScyllaDBClient;
  private client: Client | null = null;
  private connectionPromise: Promise<Client> | null = null;
  private isShuttingDown = false;

  private constructor() {
    this.setupGracefulShutdown();
  }

  static getInstance(): ScyllaDBClient {
    if (!ScyllaDBClient.instance) {
      ScyllaDBClient.instance = new ScyllaDBClient();
    }
    return ScyllaDBClient.instance;
  }

  private async createClient(): Promise<Client> {
    const { host, port, keyspace, localDatacenter, connectTimeout, readTimeout, heartbeatInterval, fetchSize } =
      config.database;

    try {
      const client = new cassandra.Client({
        contactPoints: [`${host}:${port}`],
        localDataCenter: localDatacenter,
        keyspace,
        pooling: {
          heartBeatInterval: heartbeatInterval,
        },
        socketOptions: {
          connectTimeout,
          readTimeout,
        },
        queryOptions: {
          prepare: true,
          fetchSize,
        },
      });

      await client.connect();
      return client;
    } catch (error) {
      throw new ConnectionError(
        `Failed to connect to ScyllaDB at ${host}:${port}`,
        { host, port, error: error instanceof Error ? error.message : error }
      );
    }
  }

  async connect(): Promise<Client> {
    if (this.client) {
      return this.client;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    try {
      this.connectionPromise = this.createClient();
      this.client = await this.connectionPromise;

      if (config.app.isDev) {
        console.log(`✅ ScyllaDB connected: ${config.database.host}:${config.database.port}/${config.database.keyspace}`);
      }

      return this.client;
    } catch (error) {
      this.connectionPromise = null;
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.shutdown();
      this.client = null;
      this.connectionPromise = null;

      if (config.app.isDev) {
        console.log('ScyllaDB disconnected');
      }
    }
  }

  async execute<T = Record<string, unknown>>(query: string, options?: QueryOptions): Promise<QueryResult<T>> {
    const client = await this.connect();

    try {
      const result = await client.execute(query, options?.params || [], {
        prepare: options?.prepare ?? true,
        fetchSize: options?.fetchSize ?? config.database.fetchSize,
        pageState: options?.pageState,
      });

      return {
        rows: result.rows as T[],
        rowLength: result.rowLength,
        pageState: result.pageState,
        wasApplied: () => result.wasApplied(),
      };
    } catch (error) {
      if (error instanceof cassandra.errors.NoHostAvailableError) {
        throw new ConnectionError('No ScyllaDB hosts available');
      }

      if (error instanceof cassandra.errors.OperationTimedOutError) {
        throw new TimeoutError(`Query timed out: ${query.substring(0, 100)}...`);
      }

      throw new QueryError(
        error instanceof Error ? error.message : 'Unknown query error',
        query,
        { error }
      );
    }
  }

  async batch(queries: Array<{ query: string; params?: unknown[] }>): Promise<void> {
    const client = await this.connect();

    try {
      const batchQueries = queries.map(({ query, params }) => ({
        query,
        params: params || [],
      }));

      await client.batch(batchQueries, { prepare: true });
    } catch (error) {
      throw new QueryError(
        `Batch execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BATCH',
        { error }
      );
    }
  }

  async eachRow(
    query: string,
    rowCallback: (row: cassandraDriver.types.Row) => void,
    options?: QueryOptions
  ): Promise<void> {
    const client = await this.connect();

    try {
      await new Promise<void>((resolve, reject) => {
        client.eachRow(
          query,
          options?.params || [],
          {
            prepare: options?.prepare ?? true,
            fetchSize: options?.fetchSize ?? config.database.fetchSize,
            autoPage: true,
          },
          (n, row) => {
            try {
              rowCallback(row);
            } catch (error) {
              reject(error);
            }
          },
          (error) => {
            if (error) reject(error);
            else resolve();
          }
        );
      });
    } catch (error) {
      throw new QueryError(
        `eachRow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        query,
        { error }
      );
    }
  }

  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.execute<{ now: Date }>('SELECT now() FROM system.local');
      return result.rows.length > 0;
    } catch {
      return false;
    }
  }

  isReady(): boolean {
    return this.client !== null;
  }

  private setupGracefulShutdown(): void {
    if (typeof process !== 'undefined' && !this.isShuttingDown) {
      const shutdown = async () => {
        this.isShuttingDown = true;
        console.log('Shutting down ScyllaDB connection...');
        await this.disconnect();
        process.exit(0);
      };

      process.on('SIGINT', shutdown);
      process.on('SIGTERM', shutdown);
      process.on('beforeExit', () => {
        this.disconnect();
      });
    }
  }
}

export const db = ScyllaDBClient.getInstance();
