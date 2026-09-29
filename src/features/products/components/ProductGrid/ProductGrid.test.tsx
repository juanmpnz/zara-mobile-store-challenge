import { useState } from 'react';
import { act, render, screen, within } from '@testing-library/react';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, expect, test, vi } from 'vitest';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductGrid } from './ProductGrid';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderGrid(products: ProductSummary[]) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => (
        <ProductGrid products={products} label="Phone catalog" />
      ),
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
}

function renderAnimatedGrid(initialProducts: ProductSummary[]) {
  let updateProducts: (products: ProductSummary[]) => void = () => undefined;

  function GridRoute() {
    const [products, setProducts] = useState(initialProducts);
    updateProducts = setProducts;

    return <ProductGrid products={products} label="Animated catalog" />;
  }

  const router = createRouter({
    routeTree: createRootRoute({ component: GridRoute }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);

  return (products: ProductSummary[]) => {
    act(() => updateProducts(products));
  };
}

test('renders the supplied products as cards without fetching data', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderGrid([
    { id: 'first', name: 'First phone', basePrice: 100 },
    { id: ' ', name: 'Missing stable identity', basePrice: 150 },
    { id: 'second', name: 'Second phone', basePrice: 200 },
  ]);
  const list = await screen.findByRole('list', { name: 'Phone catalog' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(3);
  expect(within(list).getByText('First phone')).toBeVisible();
  expect(within(list).getByText('Second phone')).toBeVisible();
  expect(within(list).getByText('Missing stable identity')).toBeVisible();
  expect(
    within(list)
      .getAllByRole('link')
      .map((link) => link.getAttribute('href')),
  ).toEqual(['/products/first', '/products/second']);
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('accepts empty input without rendering cards or fetching', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderGrid([]);
  const list = await screen.findByRole('list', { name: 'Phone catalog' });
  expect(within(list).queryByRole('listitem')).not.toBeInTheDocument();
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('preserves retained card identity while result sets collapse and expand', async () => {
  const samsung = {
    id: 'samsung',
    brand: 'Samsung',
    name: 'Galaxy S24',
    basePrice: 900,
  };
  const apple = {
    id: 'apple',
    brand: 'Apple',
    name: 'iPhone 15',
    basePrice: 1000,
  };
  const google = {
    id: 'google',
    brand: 'Google',
    name: 'Pixel 8',
    basePrice: 700,
  };
  const updateProducts = renderAnimatedGrid([apple, google, samsung]);
  const samsungCard = (
    await screen.findByRole('link', { name: /samsung galaxy s24/i })
  ).closest('li');

  updateProducts([samsung]);

  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(
    screen.getByRole('link', { name: /samsung galaxy s24/i }).closest('li'),
  ).toBe(samsungCard);

  updateProducts([apple, google, samsung]);

  expect(screen.getAllByRole('listitem')).toHaveLength(3);
  expect(
    screen.getByRole('link', { name: /samsung galaxy s24/i }).closest('li'),
  ).toBe(samsungCard);
});

test('updates without animation when reduced motion is requested', () => {
  const animate = vi.fn();
  const originalAnimate = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'animate',
  );
  Object.defineProperty(HTMLElement.prototype, 'animate', {
    configurable: true,
    value: animate,
  });
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockReturnValue({
      matches: true,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  );

  try {
    const updateProducts = renderAnimatedGrid([
      { id: 'first', name: 'First phone' },
      { id: 'second', name: 'Second phone' },
    ]);
    updateProducts([{ id: 'second', name: 'Second phone' }]);

    expect(animate).not.toHaveBeenCalled();
  } finally {
    if (originalAnimate) {
      Object.defineProperty(HTMLElement.prototype, 'animate', originalAnimate);
    } else {
      Reflect.deleteProperty(HTMLElement.prototype, 'animate');
    }
  }
});
