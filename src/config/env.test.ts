import { afterEach, expect, test, vi } from 'vitest';
import { testApiUrl } from '@/test/msw/handlers';

afterEach(() => {
  vi.stubEnv('VITE_API_BASE_URL', testApiUrl);
  vi.stubEnv('VITE_API_KEY', 'test-api-key');
  vi.resetModules();
});

test('trims surrounding configuration whitespace', async () => {
  vi.stubEnv('VITE_API_BASE_URL', `  ${testApiUrl}  `);
  vi.stubEnv('VITE_API_KEY', '  test-api-key  ');
  vi.resetModules();
  const { appEnvironment } = await import('./env');
  expect(appEnvironment).toEqual({
    apiBaseUrl: testApiUrl,
    apiKey: 'test-api-key',
  });
});

test.each(['VITE_API_BASE_URL', 'VITE_API_KEY'])('fails clearly when %s is missing', async (name) => {
  vi.stubEnv(name, ' ');
  vi.resetModules();
  await expect(import('./env')).rejects.toThrow(`Missing required environment variable: ${name}`);
});
