import { appEnvironment } from '@/config/env';
import { ApiError } from './ApiError';

type QueryValue = string | number | boolean | undefined;

export interface ApiRequestOptions extends Omit<RequestInit, 'headers'> {
  headers?: HeadersInit;
  query?: Readonly<Record<string, QueryValue>>;
}

function buildUrl(path: string, query: ApiRequestOptions['query']): URL {
  if (!path.startsWith('/') || path.startsWith('//')) {
    throw new Error('API request paths must be root-relative.');
  }

  const baseUrl = new URL(appEnvironment.apiBaseUrl);
  const url = new URL(path, baseUrl);

  if (url.origin !== baseUrl.origin) {
    throw new Error('API request paths must stay on the configured origin.');
  }

  for (const [name, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      url.searchParams.set(name, String(value));
    }
  }

  return url;
}

function errorMessage(status: number, body: unknown): string {
  if (
    typeof body === 'object' &&
    body !== null &&
    'message' in body &&
    typeof body.message === 'string'
  ) {
    return body.message;
  }

  return `API request failed with status ${status}.`;
}

interface ParsedBody {
  value: unknown;
  isJson: boolean;
}

function parseBody(text: string): ParsedBody {
  if (text === '') {
    return { value: undefined, isJson: true };
  }

  try {
    return { value: JSON.parse(text) as unknown, isJson: true };
  } catch {
    return { value: text, isJson: false };
  }
}

export async function apiRequest(
  path: string,
  options: ApiRequestOptions = {},
): Promise<unknown> {
  const { query, headers: requestHeaders, ...requestInit } = options;
  const headers = new Headers(requestHeaders);
  headers.set('Accept', 'application/json');
  headers.set('x-api-key', appEnvironment.apiKey);

  const response = await fetch(buildUrl(path, query), {
    ...requestInit,
    headers,
    redirect: 'error',
  });
  const parsedBody = parseBody(await response.text());

  if (!response.ok) {
    throw new ApiError(
      errorMessage(response.status, parsedBody.value),
      response.status,
      parsedBody.value,
    );
  }

  if (!parsedBody.isJson) {
    throw new ApiError(
      'API response was not valid JSON.',
      response.status,
      parsedBody.value,
    );
  }

  return parsedBody.value;
}
