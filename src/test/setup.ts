import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { testApiUrl } from './msw/handlers';
import { server } from './msw/server';

vi.stubEnv('VITE_API_BASE_URL', testApiUrl);
vi.stubEnv('VITE_API_KEY', 'test-api-key');

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => {
  server.close();
  vi.unstubAllEnvs();
});
