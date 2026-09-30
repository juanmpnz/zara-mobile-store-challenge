import { render, screen } from '@testing-library/react';
import { createRootRoute, createRouter, createMemoryHistory, RouterProvider } from '@tanstack/react-router';
import { expect, test } from 'vitest';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from './ProductCard';

function renderCard(product: ProductSummary) {
  const router = createRouter({
    routeTree: createRootRoute({
      component: () => <ProductCard product={product} />,
    }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(<RouterProvider router={router} />);
}

test('presents domain content with meaningful image text, EUR price and a detail link', async () => {
  renderCard({
    id: 'phone-1',
    name: 'Example Phone',
    brand: 'Example',
    image: '/phone.webp',
    basePrice: 550,
  });
  expect(await screen.findByText('Example Phone')).toBeVisible();
  expect(screen.getByText('Example', { exact: true })).toBeVisible();
  expect(screen.getByText('550 EUR')).toBeVisible();
  expect(screen.getByRole('img', { name: 'Example Example Phone' })).toHaveAttribute('src', '/phone.webp');
  expect(screen.getByRole('link')).toHaveAttribute('href', '/products/phone-1');
});

test('safely displays omitted fields without an invalid destination', async () => {
  renderCard({});
  expect(await screen.findByText('Unnamed product')).toBeVisible();
  expect(screen.getByText('Brand unavailable')).toBeVisible();
  expect(screen.getByText('Price unavailable')).toBeVisible();
  expect(screen.getByText('Image unavailable')).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
  expect(screen.queryByRole('img')).not.toBeInTheDocument();
});

test('treats blank identity and nonfinite price as unavailable', async () => {
  renderCard({ id: ' ', basePrice: Infinity });
  expect(await screen.findByText('Price unavailable')).toBeVisible();
  expect(screen.queryByRole('link')).not.toBeInTheDocument();
});
