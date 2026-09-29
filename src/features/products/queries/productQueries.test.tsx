import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { PropsWithChildren } from 'react';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { server } from '../../../test/msw/server';
import { productSummaryFixture, testApiUrl } from '../../../test/msw/handlers';
import {
  productKeys,
  productsQueryOptions,
  useProductsQuery,
} from './productQueries';

let client: QueryClient;

beforeEach(() => {
  client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
});
afterEach(() => {
  cleanup();
  client.clear();
});

function Wrapper({ children }: PropsWithChildren) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

test('separates server results by search, limit and offset', async () => {
  const received: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      const query = new URL(request.url).search;
      received.push(query);
      return HttpResponse.json([{ ...productSummaryFixture, name: query }]);
    }),
  );
  const variants = [
    { search: 'first', limit: 20, offset: 0 },
    { search: 'second', limit: 20, offset: 0 },
    { search: 'first', limit: 10, offset: 0 },
    { search: 'first', limit: 20, offset: 20 },
  ];
  for (const params of variants) {
    const result = await client.fetchQuery(productsQueryOptions(params));
    expect(result[0]?.name).toContain(`search=${params.search}`);
  }
  expect(new Set(received).size).toBe(4);
  for (const params of variants) {
    expect(client.getQueryData(productKeys.list(params))).toEqual([
      expect.objectContaining({
        name: `?search=${params.search}&limit=${params.limit}&offset=${params.offset}`,
      }),
    ]);
  }
});

test('normalizes default list identity and separates detail identities', () => {
  expect(productKeys.list()).toEqual(productKeys.list({ limit: 20 }));
  expect(productKeys.detail('phone-1')).not.toEqual(
    productKeys.detail('phone-2'),
  );
});

test('shares one request between identical active query consumers', async () => {
  let requests = 0;
  server.use(
    http.get(`${testApiUrl}/products`, () => {
      requests += 1;
      return HttpResponse.json([productSummaryFixture]);
    }),
  );
  const { result } = renderHook(
    () => ({
      first: useProductsQuery({ search: 'phone' }),
      second: useProductsQuery({ search: 'phone' }),
    }),
    { wrapper: Wrapper },
  );

  await waitFor(() => {
    expect(result.current.first.isSuccess).toBe(true);
    expect(result.current.second.isSuccess).toBe(true);
  });
  expect(requests).toBe(1);
  expect(result.current.first.data).toEqual(result.current.second.data);
  expect(result.current.first.data?.[0]?.image).toBe(
    productSummaryFixture.imageUrl,
  );
});

test('cancelling a query aborts its pending HTTP request', async () => {
  let requestSignal: AbortSignal | undefined;
  server.use(
    http.get(`${testApiUrl}/products`, async ({ request }) => {
      requestSignal = request.signal;
      await new Promise<void>((resolve) => {
        request.signal.addEventListener('abort', () => resolve(), {
          once: true,
        });
      });
      return HttpResponse.json([]);
    }),
  );
  const pending = client.fetchQuery(productsQueryOptions());
  // Attach rejection handling before cancellation so no rejection is unhandled.
  const settled = pending.catch((error: unknown) => error);
  await waitFor(() => expect(requestSignal).toBeDefined());
  expect(requestSignal?.aborted).toBe(false);

  await client.cancelQueries({ queryKey: productKeys.list() });

  expect(requestSignal?.aborted).toBe(true);
  await settled;
});
