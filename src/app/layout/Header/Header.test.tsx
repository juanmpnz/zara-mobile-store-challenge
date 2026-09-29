import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  createRootRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from '@tanstack/react-router';
import { beforeEach, afterEach, expect, test } from 'vitest';
import { CartProvider } from '@/features/cart/context/CartProvider';
import { useCartActions } from '@/features/cart/context/cartContext';
import { Header } from './Header';

beforeEach(() => localStorage.clear());
afterEach(() => localStorage.clear());

function Harness() {
  const { addItem } = useCartActions();
  return (
    <>
      <Header />
      <button
        onClick={() =>
          addItem({
            productId: 'phone',
            name: 'Phone',
            color: { name: 'Black' },
            storage: { capacity: '128 GB' },
            unitPrice: 500,
          })
        }
      >
        Add selection
      </button>
    </>
  );
}

function renderHeader() {
  const router = createRouter({
    routeTree: createRootRoute({ component: Harness }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  });
  render(
    <CartProvider>
      <RouterProvider router={router} />
    </CartProvider>,
  );
}

test('links home and cart with an accessible empty count', async () => {
  renderHeader();
  expect(
    await screen.findByRole('link', { name: 'MBST home' }),
  ).toHaveAttribute('href', '/');
  expect(
    screen.getByRole('link', { name: 'MBST home' }).querySelector('img'),
  ).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Cart, 0 items' })).toHaveAttribute(
    'href',
    '/cart',
  );
});

test('updates singular and plural count names through real cart actions', async () => {
  const user = userEvent.setup();
  renderHeader();
  const add = await screen.findByRole('button', { name: 'Add selection' });
  await user.click(add);
  expect(screen.getByRole('link', { name: 'Cart, 1 item' })).toHaveTextContent(
    '1',
  );
  await user.click(add);
  expect(screen.getByRole('link', { name: 'Cart, 2 items' })).toHaveTextContent(
    '2',
  );
});
