import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import { routeTree } from '@/routeTree.gen';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function renderRoute(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>,
  );
}

test('shows the catalog heading at the index URL', async () => {
  renderRoute('/');

  expect(
    await screen.findByRole('heading', {
      name: 'Zara Mobile Store Challenge',
      level: 1,
    }),
  ).toBeVisible();
});

test('shows the cart heading at the cart URL', async () => {
  renderRoute('/cart');

  expect(
    await screen.findByRole('heading', { name: 'Cart', level: 1 }),
  ).toBeVisible();
});

test('shows the design-system validation page', async () => {
  renderRoute('/dsystem');

  expect(
    await screen.findByRole('heading', { name: 'Design system', level: 1 }),
  ).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Typography' })).toBeVisible();
  expect(
    screen.getByRole('radiogroup', { name: 'Storage size' }),
  ).toBeVisible();
});

test('shows product detail and the product identity from its URL', async () => {
  renderRoute('/products/abc-123');

  expect(
    await screen.findByRole('heading', { name: 'Product detail', level: 1 }),
  ).toBeVisible();
  expect(
    screen.getByText('Product ID: abc-123', { exact: true }),
  ).toBeVisible();
});

test('shows the not-found heading for an unknown URL', async () => {
  renderRoute('/unknown-page');

  expect(
    await screen.findByRole('heading', { name: 'Page not found', level: 1 }),
  ).toBeVisible();
});
