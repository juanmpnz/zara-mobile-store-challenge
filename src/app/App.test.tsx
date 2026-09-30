import { render, screen } from '@testing-library/react';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import { routeTree } from '@/routeTree.gen';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function renderRoute(path: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryClientProvider>,
  );
}

test('shows the product catalog at the index URL', async () => {
  renderRoute('/');

  expect(
    await screen.findByRole('heading', {
      name: 'Products',
      level: 1,
    }),
  ).toBeVisible();
});

test('shows the cart heading at the cart URL', async () => {
  renderRoute('/cart');

  expect(await screen.findByRole('heading', { name: 'CART (0)', level: 1 })).toBeVisible();
});

test('shows the design-system validation page', async () => {
  renderRoute('/dsystem');

  expect(await screen.findByRole('heading', { name: 'Design system', level: 1 })).toBeVisible();
  expect(screen.getByRole('heading', { name: 'Typography' })).toBeVisible();
  expect(screen.getByRole('radiogroup', { name: 'Storage size' })).toBeVisible();
});

test('shows API-backed product detail for the product identity in its URL', async () => {
  renderRoute('/products/abc-123');

  expect(await screen.findByRole('heading', { name: 'Example Phone', level: 1 })).toBeVisible();
  expect(screen.getByRole('link', { name: 'BACK' })).toHaveAttribute('href', '/');
});

test('shows the not-found heading for an unknown URL', async () => {
  renderRoute('/unknown-page');

  expect(await screen.findByRole('heading', { name: 'Page not found', level: 1 })).toBeVisible();
});
