import { render, screen } from '@testing-library/react';
import {
  createMemoryHistory,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { expect, test } from 'vitest';
import { routeTree } from '@/routeTree.gen';

function renderRoute(path: string) {
  const router = createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [path] }),
  });

  return render(<RouterProvider router={router} />);
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
