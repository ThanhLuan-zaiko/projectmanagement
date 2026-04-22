import { NextRequest, NextResponse } from 'next/server';
import { verifyCsrfRequest } from '@/utils/csrf';

const DEFAULT_MAX_JSON_BYTES = 64 * 1024;

export class RouteError extends Error {
  status: number;
  body: Record<string, unknown>;

  constructor(status: number, message: string, body: Record<string, unknown> = {}) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

export function routeError(
  status: number,
  message: string,
  body: Record<string, unknown> = {}
): RouteError {
  return new RouteError(status, message, body);
}

export function errorResponse(
  status: number,
  message: string,
  body: Record<string, unknown> = {}
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...body,
    },
    { status }
  );
}

export function handleRouteError(error: unknown, fallbackMessage: string) {
  if (error instanceof RouteError) {
    return errorResponse(error.status, error.message, error.body);
  }

  console.error(fallbackMessage, error);
  return errorResponse(500, fallbackMessage);
}

export async function parseJsonBody<T = Record<string, unknown>>(
  request: NextRequest,
  options: { maxBytes?: number } = {}
): Promise<T> {
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_JSON_BYTES;
  const contentLength = Number(request.headers.get('content-length') || '0');
  const contentType = request.headers.get('content-type') || '';

  if (contentLength > maxBytes) {
    throw routeError(413, 'Request body is too large.');
  }

  if (!contentType.toLowerCase().includes('application/json')) {
    throw routeError(415, 'Content-Type must be application/json.');
  }

  try {
    return (await request.json()) as T;
  } catch {
    throw routeError(400, 'Invalid JSON payload.');
  }
}

export function requireCsrf(request: NextRequest) {
  if (!verifyCsrfRequest(request)) {
    throw routeError(403, 'Invalid CSRF token.');
  }
}

export function parseIntegerParam(value: string | null, fallback: number, min = 1) {
  const parsed = Number.parseInt(value || '', 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(parsed, min);
}
