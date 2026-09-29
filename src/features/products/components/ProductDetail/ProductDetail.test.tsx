import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { delay, http, HttpResponse } from 'msw';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import { routeTree } from '@/routeTree.gen';
import { productDetailFixture, testApiUrl } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function renderDetail(productId = 'phone-1') {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({
      initialEntries: [`/products/${productId}`],
    }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryClientProvider>,
  );
}

test('selects a complete variant and adds exact independent cart-line snapshots', async () => {
  const user = userEvent.setup();
  renderDetail();

  expect(
    await screen.findByRole('heading', { name: 'Example Phone' }),
  ).toBeVisible();
  expect(screen.getByText('From 500 EUR')).toBeVisible();
  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeDisabled();
  expect(screen.getByRole('radio', { name: '256 GB' })).not.toBeChecked();
  expect(screen.getByRole('radio', { name: 'Black' })).not.toBeChecked();

  await user.click(screen.getByRole('radio', { name: 'Black' }));
  expect(screen.getByText('Black', { selector: 'p' })).toBeVisible();
  expect(addButton).toBeDisabled();

  await user.click(screen.getByRole('radio', { name: '256 GB' }));
  expect(screen.getByText('550 EUR')).toBeVisible();
  expect(addButton).toBeEnabled();

  await user.click(addButton);
  await user.click(addButton);
  expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toBeVisible();
  await waitFor(() => {
    const stored = JSON.parse(
      localStorage.getItem('zara-mobile-store:cart:v1') ?? '{}',
    ) as { items?: unknown[] };
    const items = stored.items as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]?.id).not.toBe(items[1]?.id);
    const snapshots = items.map((item) => {
      const snapshot = { ...item };
      delete snapshot.id;
      return snapshot;
    });
    expect(snapshots).toEqual([
      {
        productId: 'phone-1',
        name: 'Example Phone',
        image: 'https://images.example.test/phone.webp',
        color: { name: 'Black', hex: '#000000' },
        storage: { capacity: '256 GB' },
        unitPrice: 550,
      },
      {
        productId: 'phone-1',
        name: 'Example Phone',
        image: 'https://images.example.test/phone.webp',
        color: { name: 'Black', hex: '#000000' },
        storage: { capacity: '256 GB' },
        unitPrice: 550,
      },
    ]);
  });
});

test('uses keyboard radio navigation to select storage and update its price', async () => {
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({
        ...productDetailFixture,
        storageOptions: [
          { capacity: '128 GB', price: 500 },
          { capacity: '256 GB', price: 550 },
        ],
      }),
    ),
  );
  const user = userEvent.setup();
  renderDetail();
  const firstStorage = await screen.findByRole('radio', { name: '128 GB' });

  firstStorage.focus();
  await user.keyboard('{ArrowRight>}');

  await waitFor(() =>
    expect(screen.getByRole('radio', { name: '256 GB' })).toBeChecked(),
  );
  await user.keyboard('{/ArrowRight}');
  expect(screen.getByText('550 EUR')).toBeVisible();
  expect(
    screen.getByRole('radiogroup', {
      name: 'Storage. How much space do you need?',
    }),
  ).toBeVisible();
  expect(
    screen.getByRole('radiogroup', { name: 'Color. Pick your favourite.' }),
  ).toBeVisible();
});

test('changes the product image to the selected color image', async () => {
  const blueImage = 'https://images.example.test/phone-blue.webp';
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({
        ...productDetailFixture,
        colorOptions: [
          ...productDetailFixture.colorOptions,
          { name: 'Blue', hexCode: '#0000ff', imageUrl: blueImage },
        ],
      }),
    ),
  );
  const user = userEvent.setup();
  renderDetail();
  const image = await screen.findByRole('img', { name: 'Example Phone' });

  await user.click(screen.getByRole('radio', { name: 'Blue' }));

  expect(
    screen.getByRole('img', { name: 'Example Phone in Blue' }),
  ).toHaveAttribute('src', blueImage);
  expect(image).not.toBeInTheDocument();
});

test('does not name a selected color when its image falls back to another color', async () => {
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({
        ...productDetailFixture,
        colorOptions: [
          ...productDetailFixture.colorOptions,
          { name: 'Blue', hexCode: '#0000ff' },
        ],
      }),
    ),
  );
  const user = userEvent.setup();
  renderDetail();
  await screen.findByRole('img', { name: 'Example Phone' });

  await user.click(screen.getByRole('radio', { name: 'Blue' }));

  expect(screen.getByRole('img', { name: 'Example Phone' })).toHaveAttribute(
    'src',
    'https://images.example.test/phone.webp',
  );
  expect(
    screen.queryByRole('img', { name: 'Example Phone in Blue' }),
  ).not.toBeInTheDocument();
});

test('renders specifications and embedded similar products without another request', async () => {
  let requestCount = 0;
  const requestedIds: string[] = [];
  server.use(
    http.get(`${testApiUrl}/products/:productId`, ({ params }) => {
      requestCount += 1;
      requestedIds.push(String(params.productId));
      return HttpResponse.json(productDetailFixture);
    }),
  );
  renderDetail();

  expect(await screen.findByText('6 inches')).toBeVisible();
  expect(screen.getByText('Example OS')).toBeVisible();
  expect(screen.getByRole('link', { name: /example phone/i })).toHaveAttribute(
    'href',
    '/products/phone-2',
  );
  expect(requestCount).toBe(1);
  expect(requestedIds).toEqual(['phone-1']);
});

test('scrolls similar products by dragging without opening a card', async () => {
  vi.stubGlobal('PointerEvent', MouseEvent);
  renderDetail();
  const rail = await screen.findByRole('list', { name: 'Similar products' });
  const productLink = screen.getByRole('link', { name: /example phone/i });
  Object.defineProperty(rail, 'scrollLeft', { value: 100, writable: true });

  fireEvent.pointerDown(rail, {
    button: 0,
    clientX: 240,
    pointerId: 1,
    pointerType: 'mouse',
  });
  fireEvent.pointerMove(rail, {
    clientX: 160,
    pointerId: 1,
    pointerType: 'mouse',
  });

  expect(rail.scrollLeft).toBe(180);
  expect(rail).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerUp(rail, { pointerId: 1, pointerType: 'mouse' });
  expect(rail).not.toHaveAttribute('data-dragging');
  expect(fireEvent.click(productLink)).toBe(false);
  expect(screen.getByRole('heading', { name: 'Example Phone' })).toBeVisible();
});

test('scrolls similar products by dragging the custom scrollbar', async () => {
  vi.stubGlobal('PointerEvent', MouseEvent);
  renderDetail();
  const rail = await screen.findByRole('list', { name: 'Similar products' });
  const scrollbar = rail.nextElementSibling as HTMLDivElement;
  Object.defineProperties(rail, {
    clientWidth: { value: 300, configurable: true },
    scrollWidth: { value: 900, configurable: true },
    scrollLeft: { value: 100, writable: true, configurable: true },
  });
  Object.defineProperty(scrollbar, 'clientWidth', {
    value: 300,
    configurable: true,
  });
  fireEvent.scroll(rail);

  fireEvent.pointerDown(scrollbar, {
    button: 0,
    clientX: 50,
    pointerId: 2,
    pointerType: 'mouse',
  });
  fireEvent.pointerMove(scrollbar, {
    clientX: 100,
    pointerId: 2,
    pointerType: 'mouse',
  });

  expect(rail.scrollLeft).toBeCloseTo(250);
  expect(scrollbar).toHaveAttribute('data-dragging', 'true');

  fireEvent.pointerUp(scrollbar, { pointerId: 2, pointerType: 'mouse' });
  expect(scrollbar).not.toHaveAttribute('data-dragging');
});

test('omits missing specifications and keeps invalid variant data safely disabled', async () => {
  const longDescription = 'A detailed description '.repeat(20).trim();
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({
        ...productDetailFixture,
        description: longDescription,
        specs: { screen: '6 inches' },
        colorOptions: [{ name: '', hexCode: '#000000' }],
        storageOptions: [{ capacity: '256 GB' }],
        similarProducts: undefined,
      }),
    ),
  );
  renderDetail();

  expect(await screen.findByText(longDescription)).toBeVisible();
  expect(screen.queryByText('Example OS')).not.toBeInTheDocument();
  expect(screen.queryByRole('radiogroup', { name: /color/i })).toBeNull();
  expect(screen.queryByText('SIMILAR ITEMS')).not.toBeInTheDocument();
  expect(screen.getByRole('radio', { name: '256 GB' })).toBeDisabled();
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  expect(screen.getByText('From 500 EUR')).toBeVisible();
});

test('resets both selections when a similar-product route changes the product id', async () => {
  const user = userEvent.setup();
  renderDetail();

  await user.click(await screen.findByRole('radio', { name: '256 GB' }));
  await user.click(screen.getByRole('radio', { name: 'Black' }));
  expect(screen.getByRole('button', { name: /add/i })).toBeEnabled();

  await user.click(screen.getByRole('link', { name: /example phone/i }));

  await waitFor(() => {
    expect(screen.getByRole('radio', { name: '256 GB' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Black' })).not.toBeChecked();
  });
  expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
});

test('shows loading feedback and automatically retries one transient detail error', async () => {
  let requestCount = 0;
  server.use(
    http.get(`${testApiUrl}/products/:productId`, async () => {
      requestCount += 1;
      await delay(100);
      return requestCount === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json(productDetailFixture);
    }),
  );
  renderDetail('retryable');

  expect(await screen.findByRole('status')).toHaveTextContent(
    'Loading product…',
  );
  expect(
    await screen.findByRole('heading', { name: 'Example Phone' }),
  ).toBeVisible();
  expect(requestCount).toBe(2);
});

test('renders distinct not-found and retryable error states', async () => {
  let notFoundRequests = 0;
  server.use(
    http.get(`${testApiUrl}/products/:productId`, () => {
      notFoundRequests += 1;
      return HttpResponse.json({}, { status: 404 });
    }),
  );
  const firstRender = renderDetail('missing');
  expect(await screen.findByText('Product not found.')).toBeVisible();
  expect(notFoundRequests).toBe(1);
  firstRender.unmount();

  server.use(
    http.get(`${testApiUrl}/products/:productId`, () =>
      HttpResponse.json({}, { status: 500 }),
    ),
  );
  renderDetail('broken');
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'We could not load this product.',
  );
  expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
});
