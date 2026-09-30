import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryHistory, createRouter, RouterProvider } from '@tanstack/react-router';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import type { CartLine } from '@/features/cart/model/cart';
import { routeTree } from '@/routeTree.gen';

const storageKey = 'zara-mobile-store:cart:v1';

const firstLine: CartLine = {
  id: 'line-1',
  productId: 'phone-1',
  name: 'Galaxy S24 Ultra',
  image: 'https://images.example.test/phone.webp',
  color: { name: 'Violeta Titanium', hex: '#554b62' },
  storage: { capacity: '512 GB' },
  unitPrice: 1199,
};

const secondLine: CartLine = {
  ...firstLine,
  id: 'line-2',
  storage: { capacity: '256 GB' },
  unitPrice: 1099,
};

beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function renderCart(items: readonly CartLine[] = []) {
  localStorage.setItem(storageKey, JSON.stringify({ version: 1, items }));
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const history = createMemoryHistory({ initialEntries: ['/cart'] });
  const router = createRouter({ routeTree, history });

  render(
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <RouterProvider router={router} />
      </CartProvider>
    </QueryClientProvider>,
  );

  return { history };
}

test('renders the empty cart with only a semantic shopping link', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch');
  renderCart();

  expect(await screen.findByRole('heading', { name: 'CART (0)' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'CONTINUE SHOPPING' })).toHaveAttribute('href', '/');
  expect(screen.queryByText('TOTAL')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'PAY' })).not.toBeInTheDocument();
  expect(fetchSpy).not.toHaveBeenCalled();
});

test('renders persisted line details and the derived total', async () => {
  renderCart([firstLine, secondLine]);

  expect(await screen.findByRole('heading', { name: 'CART (2)' })).toBeVisible();
  const list = screen.getByRole('list', { name: 'Cart items' });
  expect(within(list).getAllByRole('listitem')).toHaveLength(2);
  expect(within(list).getAllByRole('heading', { name: 'Galaxy S24 Ultra' })).toHaveLength(2);
  expect(within(list).getByText('512 GB | Violeta Titanium')).toBeVisible();
  expect(screen.getByLabelText('Total 2298 EUR')).toBeVisible();
});

test('removes only the selected independent line and persists the result', async () => {
  const user = userEvent.setup();
  renderCart([firstLine, secondLine]);
  await screen.findByRole('heading', { name: 'CART (2)' });

  const removeButtons = screen.getAllByRole('button', {
    name: 'Eliminar Galaxy S24 Ultra del carrito',
  });
  expect(removeButtons).toHaveLength(2);
  await user.click(removeButtons[0]!);

  expect(await screen.findByRole('heading', { name: 'CART (1)' })).toBeVisible();
  expect(screen.getAllByRole('listitem')).toHaveLength(1);
  expect(within(screen.getByRole('listitem')).getByText('1099 EUR')).toBeVisible();
  await waitFor(() => {
    const persisted = JSON.parse(localStorage.getItem(storageKey) ?? '{}') as {
      items?: CartLine[];
    };
    expect(persisted.items?.map((item) => item.id)).toEqual(['line-2']);
  });

  await user.click(
    screen.getByRole('button', {
      name: 'Eliminar Galaxy S24 Ultra del carrito',
    }),
  );

  expect(await screen.findByRole('heading', { name: 'CART (0)' })).toBeVisible();
  expect(screen.getByRole('link', { name: 'Cart, 0 items' })).toHaveTextContent('0');
  expect(screen.queryByRole('list', { name: 'Cart items' })).not.toBeInTheDocument();
  expect(screen.queryByText('TOTAL')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'PAY' })).not.toBeInTheDocument();
  await waitFor(() => {
    expect(JSON.parse(localStorage.getItem(storageKey) ?? '{}')).toEqual({
      version: 1,
      items: [],
    });
  });
});

test('keeps payment visually active but explicitly unavailable and actionless', async () => {
  const user = userEvent.setup();
  const { history } = renderCart([firstLine]);
  const pay = await screen.findByRole('button', { name: 'PAY' });

  expect(pay).toHaveAttribute('aria-disabled', 'true');
  expect(pay).toBeEnabled();
  expect(pay).toHaveAccessibleDescription('Payment is not available in this challenge.');
  await user.click(pay);
  expect(history.location.pathname).toBe('/cart');
});
