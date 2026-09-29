import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import { routeTree } from '@/routeTree.gen';
import { productSummaryFixture, testApiUrl } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

let queryClient: QueryClient;

beforeEach(() => {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  localStorage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  queryClient.clear();
  localStorage.clear();
});

function renderCatalog() {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryClientProvider>,
  );
}

test('requests the first 20 products and renders the real response count', async () => {
  let requestUrl = '';
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      requestUrl = request.url;
      return HttpResponse.json([
        productSummaryFixture,
        {
          ...productSummaryFixture,
          id: 'phone-2',
          brand: 'Second',
          name: 'Second Phone',
        },
      ]);
    }),
  );

  renderCatalog();

  expect(
    await screen.findByRole('searchbox', { name: 'Search products' }),
  ).toBeVisible();
  expect(await screen.findByText('2 RESULTS')).toHaveAttribute(
    'aria-live',
    'polite',
  );
  expect(screen.getByRole('link', { name: /example phone/i })).toHaveAttribute(
    'href',
    '/products/phone-1',
  );
  expect(screen.getByRole('link', { name: /second phone/i })).toBeVisible();
  expect(Object.fromEntries(new URL(requestUrl).searchParams)).toEqual({
    limit: '20',
  });
});

test('counts and renders a product without an id without inventing a detail link', async () => {
  server.use(
    http.get(`${testApiUrl}/products`, () =>
      HttpResponse.json([
        {
          brand: 'Incomplete Brand',
          name: 'Incomplete Phone',
          basePrice: 250,
          imageUrl: productSummaryFixture.imageUrl,
        },
      ]),
    ),
  );

  renderCatalog();

  expect(await screen.findByText('1 RESULTS')).toBeVisible();
  expect(screen.getByText('Incomplete Phone')).toBeVisible();
  expect(
    screen.queryByRole('link', { name: /incomplete phone/i }),
  ).not.toBeInTheDocument();
});

test('debounces rapid input and searches on the server with the trimmed value', async () => {
  const requests: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      const search = new URL(request.url).searchParams.get('search') ?? '';
      requests.push(search);
      return HttpResponse.json(
        search
          ? [
              {
                ...productSummaryFixture,
                id: 'samsung-1',
                brand: 'Samsung',
                name: 'Galaxy S24',
              },
            ]
          : [productSummaryFixture],
      );
    }),
  );

  renderCatalog();
  await screen.findByText('1 RESULTS');
  expect(screen.getByText('Example Phone')).toBeVisible();
  vi.useFakeTimers();
  const input = screen.getByRole('searchbox', { name: 'Search products' });

  fireEvent.change(input, { target: { value: ' S' } });
  fireEvent.change(input, { target: { value: ' Sa' } });
  fireEvent.change(input, { target: { value: ' Samsung ' } });
  expect(requests).toEqual(['']);
  expect(screen.getByText('Example Phone')).toBeVisible();

  await act(async () => vi.advanceTimersByTimeAsync(299));
  expect(requests).toEqual(['']);
  await act(async () => vi.advanceTimersByTimeAsync(1));
  vi.useRealTimers();
  await waitFor(() => expect(requests).toEqual(['', 'Samsung']));
});

test('keeps prior products visible and announces an update while search loads', async () => {
  let releaseSearchResponse: (() => void) | undefined;
  const searchResponsePending = new Promise<void>((resolve) => {
    releaseSearchResponse = resolve;
  });

  server.use(
    http.get(`${testApiUrl}/products`, async ({ request }) => {
      const search = new URL(request.url).searchParams.get('search');

      if (search) {
        await searchResponsePending;
        return HttpResponse.json([
          {
            ...productSummaryFixture,
            id: 'search-1',
            name: 'Search Result One',
          },
          {
            ...productSummaryFixture,
            id: 'search-2',
            name: 'Search Result Two',
          },
        ]);
      }

      return HttpResponse.json([productSummaryFixture]);
    }),
  );

  renderCatalog();
  expect(await screen.findByText('Example Phone')).toBeVisible();
  expect(screen.getByText('1 RESULTS')).toBeVisible();

  vi.useFakeTimers();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search products' }), {
    target: { value: 'Galaxy' },
  });
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();

  const updatingStatus = await screen.findByRole('status', {
    name: 'Updating products…',
  });
  expect(screen.getByText('Example Phone')).toBeVisible();
  expect(screen.queryByText('1 RESULTS')).not.toBeInTheDocument();
  expect(updatingStatus.parentElement).toHaveAttribute('aria-busy', 'true');

  releaseSearchResponse?.();

  expect(await screen.findByText('2 RESULTS')).toBeVisible();
  expect(screen.getByText('Search Result One')).toBeVisible();
  expect(screen.queryByText('Example Phone')).not.toBeInTheDocument();
  expect(
    screen.queryByRole('status', { name: 'Updating products…' }),
  ).not.toBeInTheDocument();
});

test('renders products returned by a server-side name search', async () => {
  const requests: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      const search = new URL(request.url).searchParams.get('search') ?? '';
      requests.push(search);

      return HttpResponse.json(
        search === 'Galaxy'
          ? [
              {
                ...productSummaryFixture,
                id: 'samsung-1',
                brand: 'Samsung',
                name: 'Galaxy S24',
              },
            ]
          : [productSummaryFixture],
      );
    }),
  );
  renderCatalog();
  await screen.findByText('Example Phone');
  vi.useFakeTimers();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search products' }), {
    target: { value: 'Galaxy' },
  });
  expect(requests).toEqual(['']);
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();

  expect(await screen.findByText('Galaxy S24')).toBeVisible();
  expect(screen.queryByText('Example Phone')).not.toBeInTheDocument();
  expect(screen.getByText('1 RESULTS')).toBeVisible();
  expect(requests).toEqual(['', 'Galaxy']);
});

test('renders products returned by a server-side brand search', async () => {
  const requests: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      const search = new URL(request.url).searchParams.get('search') ?? '';
      requests.push(search);

      return HttpResponse.json(
        search === 'Nothing'
          ? []
          : search === 'Apple'
            ? [
                {
                  ...productSummaryFixture,
                  id: 'apple-1',
                  brand: 'Apple',
                  name: 'iPhone 15',
                },
              ]
            : [productSummaryFixture],
      );
    }),
  );
  renderCatalog();
  await screen.findByText('Example Phone');
  vi.useFakeTimers();
  fireEvent.change(screen.getByRole('searchbox', { name: 'Search products' }), {
    target: { value: 'Apple' },
  });
  expect(requests).toEqual(['']);
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();

  expect(await screen.findByText('iPhone 15')).toBeVisible();
  expect(screen.getByText('Apple', { exact: true })).toBeVisible();
  expect(screen.getByText('1 RESULTS')).toBeVisible();
  expect(requests).toEqual(['', 'Apple']);
});

test('clearing search immediately restores the default query and input focus', async () => {
  const requests: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, ({ request }) => {
      const search = new URL(request.url).searchParams.get('search') ?? '';
      requests.push(search);
      return HttpResponse.json([
        {
          ...productSummaryFixture,
          id: search ? 'search-result' : 'default-result',
          name: search ? 'Search Result' : 'Default Result',
        },
      ]);
    }),
  );
  renderCatalog();
  await screen.findByText('Default Result');
  vi.useFakeTimers();
  const input = screen.getByRole('searchbox', { name: 'Search products' });
  fireEvent.change(input, { target: { value: 'Apple' } });
  expect(requests).toEqual(['']);
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();
  await waitFor(() => expect(requests).toContain('Apple'));
  expect(await screen.findByText('Search Result')).toBeVisible();

  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Clear search' }));
  expect(input).toHaveValue('');
  expect(input).toHaveFocus();
  expect(await screen.findByText('Default Result')).toBeVisible();
});

test('does not expose cancellation as an error when a newer search replaces it', async () => {
  let obsoleteRequestAborted = false;
  const requests: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products`, async ({ request }) => {
      const search = new URL(request.url).searchParams.get('search') ?? '';
      requests.push(search);

      if (search === 'Obsolete') {
        await new Promise<void>((resolve) => {
          request.signal.addEventListener(
            'abort',
            () => {
              obsoleteRequestAborted = true;
              resolve();
            },
            { once: true },
          );
        });
        return HttpResponse.json([]);
      }

      return HttpResponse.json([
        {
          ...productSummaryFixture,
          id: search ? 'current-result' : 'default-result',
          name: search ? 'Current Result' : 'Default Result',
        },
      ]);
    }),
  );

  renderCatalog();
  await screen.findByText('Default Result');
  const input = screen.getByRole('searchbox', { name: 'Search products' });

  vi.useFakeTimers();
  fireEvent.change(input, { target: { value: 'Obsolete' } });
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();
  await waitFor(() => expect(requests).toContain('Obsolete'));

  vi.useFakeTimers();
  fireEvent.change(input, { target: { value: 'Current' } });
  void act(() => vi.advanceTimersByTime(300));
  vi.useRealTimers();

  expect(await screen.findByText('Current Result')).toBeVisible();
  expect(obsoleteRequestAborted).toBe(true);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

test('shows an empty result without removing the usable search', async () => {
  server.use(http.get(`${testApiUrl}/products`, () => HttpResponse.json([])));

  renderCatalog();

  expect(await screen.findByText('0 RESULTS')).toBeVisible();
  expect(screen.getByText('No products found.')).toBeVisible();
  expect(
    screen.getByRole('searchbox', { name: 'Search products' }),
  ).toBeEnabled();
});

test('shows an accessible error and retries the catalog request', async () => {
  let attempts = 0;
  server.use(
    http.get(`${testApiUrl}/products`, () => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json(
            { message: 'private transport detail' },
            { status: 500 },
          )
        : HttpResponse.json([productSummaryFixture]);
    }),
  );
  const user = userEvent.setup();

  renderCatalog();

  expect(await screen.findByRole('alert')).toHaveTextContent(
    'Unable to load products.',
  );
  expect(
    screen.queryByText('private transport detail'),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Retry' }));

  expect(await screen.findByText('1 RESULTS')).toBeVisible();
  expect(attempts).toBe(2);
});
