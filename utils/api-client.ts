'use client';

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './csrf';

function readCookie(name: string): string {
  if (typeof document === 'undefined') {
    return '';
  }

  const prefix = `${name}=`;
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix));

  if (!match) {
    return '';
  }

  return decodeURIComponent(match.slice(prefix.length));
}

export function getCsrfToken(): string {
  return readCookie(CSRF_COOKIE_NAME);
}

export function buildMutationHeaders(headers?: HeadersInit): Headers {
  const nextHeaders = new Headers(headers || {});
  const csrfToken = getCsrfToken();

  if (csrfToken) {
    nextHeaders.set(CSRF_HEADER_NAME, csrfToken);
  }

  return nextHeaders;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const method = (init.method || 'GET').toUpperCase();
  const shouldAttachCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);

  return fetch(input, {
    ...init,
    credentials: init.credentials || 'same-origin',
    headers: shouldAttachCsrf ? buildMutationHeaders(init.headers) : init.headers,
  });
}
