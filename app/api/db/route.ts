import { NextRequest, NextResponse } from 'next/server';
import { db, config, ConnectionError, QueryError } from '@/config';

export async function GET(request: NextRequest) {
  try {
    const isHealthy = await db.healthCheck();

    if (isHealthy) {
      return NextResponse.json({
        status: 'connected',
        message: 'ScyllaDB connection is healthy',
        database: {
          host: config.database.host,
          port: config.database.port,
          keyspace: config.database.keyspace,
        },
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          status: 'disconnected',
          message: 'ScyllaDB is not connected',
          timestamp: new Date().toISOString(),
        },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Database health check error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to check database connection',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const client = await db.connect();

    return NextResponse.json({
      status: 'success',
      message: 'ScyllaDB connected successfully',
      database: {
        host: config.database.host,
        port: config.database.port,
        keyspace: config.database.keyspace,
        contactPoints: client.hosts ? Array.from(client.hosts.values()).map(h => h.address) : [],
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);

    if (error instanceof ConnectionError) {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Connection failed',
          error: error.message,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to connect to ScyllaDB',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
