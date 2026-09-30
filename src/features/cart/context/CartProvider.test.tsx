import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { CartProvider } from './CartProvider';
import { useCartActions, useCartState } from './cartContext';

const key = 'zara-mobile-store:cart:v1';
const selection = {
  productId: 'phone',
  name: 'Phone',
  color: { name: 'Black' },
  storage: { capacity: '256 GB' },
  unitPrice: 550,
};
const firstId = '00000000-0000-4000-8000-000000000001';
const secondId = '00000000-0000-4000-8000-000000000002';

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(crypto, 'randomUUID').mockReturnValueOnce(firstId).mockReturnValueOnce(secondId);
});
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

function useCart() {
  return { state: useCartState(), actions: useCartActions() };
}

test('hydrates the first rendered context from stored snapshot prices', () => {
  const line = { ...selection, id: firstId, unitPrice: 321 };
  localStorage.setItem(key, JSON.stringify({ version: 1, items: [line] }));
  const observedCounts: number[] = [];
  const { result } = renderHook(
    () => {
      const cart = useCartState();
      observedCounts.push(cart.itemCount);
      return cart;
    },
    { wrapper: CartProvider },
  );
  expect(observedCounts[0]).toBe(1);
  expect(result.current).toEqual({ items: [line], itemCount: 1, total: 321 });
});

test('adds duplicate selections with independent IDs, removes one, and clears with automatic persistence', () => {
  const { result } = renderHook(useCart, { wrapper: CartProvider });
  act(() => {
    result.current.actions.addItem(selection);
    result.current.actions.addItem(selection);
  });
  expect(result.current.state.items.map((item) => item.id)).toEqual([firstId, secondId]);
  expect(result.current.state.itemCount).toBe(2);
  expect(result.current.state.total).toBe(1100);
  expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({
    version: 1,
    items: result.current.state.items,
  });
  act(() => result.current.actions.removeItem(firstId));
  expect(result.current.state.items).toEqual([{ ...selection, id: secondId }]);
  expect(result.current.state.itemCount).toBe(1);
  expect(result.current.state.total).toBe(550);
  expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({
    version: 1,
    items: result.current.state.items,
  });
  act(() => result.current.actions.clearCart());
  expect(result.current.state).toEqual({ items: [], itemCount: 0, total: 0 });
  expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({
    version: 1,
    items: [],
  });
});

test('recovers from malformed storage and permits subsequent persistent additions', () => {
  localStorage.setItem(key, '{broken');
  const { result } = renderHook(useCart, { wrapper: CartProvider });
  expect(result.current.state.itemCount).toBe(0);
  act(() => result.current.actions.addItem(selection));
  expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({
    version: 1,
    items: [{ ...selection, id: firstId }],
  });
});

test('keeps in-memory additions and removals usable after storage writes fail', () => {
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  const { result } = renderHook(useCart, { wrapper: CartProvider });
  act(() => result.current.actions.addItem(selection));
  expect(result.current.state.itemCount).toBe(1);
  expect(result.current.state.total).toBe(550);
  act(() => result.current.actions.removeItem(firstId));
  expect(result.current.state.itemCount).toBe(0);
  act(() => result.current.actions.addItem(selection));
  act(() => result.current.actions.clearCart());
  expect(result.current.state.items).toEqual([]);
});

test.each([useCartState, useCartActions])('rejects a context hook outside CartProvider', (hook) => {
  // React reports the intentionally thrown render error to the console.
  vi.spyOn(console, 'error').mockImplementation(() => undefined);
  expect(() => renderHook(() => hook())).toThrow('must be used within CartProvider');
});
