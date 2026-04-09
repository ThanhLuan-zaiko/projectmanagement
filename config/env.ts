// Environment configuration with validation

function required(key: string, fallback?: string): string {
  const value = process.env[key] || fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function optional(key: string, fallback?: string): string {
  return process.env[key] || fallback || '';
}

function parsePort(key: string, fallback: number): number {
  const value = process.env[key];
  if (!value) return fallback;
  const port = parseInt(value, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid port number: ${value}`);
  }
  return port;
}

export const config = {
  app: {
    name: optional('NEXT_PUBLIC_APP_NAME', 'Project Management'),
    url: optional('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
    env: process.env.NODE_ENV || 'development',
    isDev: process.env.NODE_ENV === 'development',
    isProd: process.env.NODE_ENV === 'production',
  },

  database: {
    host: optional('SCYLLA_DB_HOST', 'localhost'),
    port: parsePort('SCYLLA_DB_PORT', 9042),
    keyspace: required('SCYLLA_DB_KEYSPACE', 'project_management'),
    localDatacenter: optional('SCYLLA_DB_LOCAL_DATACENTER', 'datacenter1'),
    connectTimeout: 10000,
    readTimeout: 10000,
    heartbeatInterval: 30000,
    maxRetries: 3,
    fetchSize: 1000,
  },

  auth: {
    secret: optional('AUTH_SECRET'),
    url: optional('AUTH_URL'),
  },
} as const;
