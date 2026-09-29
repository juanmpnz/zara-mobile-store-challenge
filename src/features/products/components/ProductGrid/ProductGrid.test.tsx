import { render, screen, within } from '@testing-library/react';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, expect, test, vi } from 'vitest';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductGrid } from './ProductGrid';

afterEach(() => vi.restoreAllMocks());

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

test('renders the supplied products as cards without fetching data', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderGrid([
    { id: 'first', name: 'First phone', basePrice: 100 },
    { id: ' ', name: 'Missing stable identity', basePrice: 150 },
    { id: 'second', name: 'Second phone', basePrice: 200 },
  ]);
  const list = await screen.findByRole('list', { name: 'Phone catalog' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  expect(within(list).getByText('First phone')).toBeVisible();
  expect(within(list).getByText('Second phone')).toBeVisible();
  expect(
    within(list).queryByText('Missing stable identity'),
  ).not.toBeInTheDocument();
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
