import { expect, test } from 'vitest';
import { cartReducer, createCartLine, emptyCartState, selectCartItemCount, selectCartTotal } from './cart';

const selection = {
  productId: 'phone',
  name: 'Phone',
  color: { name: 'Black' },
  storage: { capacity: '256 GB' },
  unitPrice: 550,
};

test('adds independent duplicate selections, removes one, and derives count and total immutably', () => {
  const first = createCartLine('first', selection);
  const second = createCartLine('second', selection);
  const original = { items: Object.freeze([first]) };
  const added = cartReducer(original, { type: 'add', item: second });
  expect(added.items).toEqual([first, second]);
  expect(original.items).toEqual([first]);
  expect(selectCartItemCount(added.items)).toBe(2);
  expect(selectCartTotal(added.items)).toBe(1100);
  const removed = cartReducer(added, { type: 'remove', id: 'first' });
  expect(removed.items).toEqual([second]);
  expect(added.items).toEqual([first, second]);
  expect(selectCartTotal(removed.items)).toBe(550);
  expect(cartReducer(removed, { type: 'clear' }).items).toEqual([]);
  expect(removed.items).toEqual([second]);
});

test('adds a line to an empty cart and leaves unknown removals unchanged', () => {
  const line = createCartLine('first', selection);
  expect(cartReducer(emptyCartState, { type: 'add', item: line }).items).toEqual([line]);
  expect(emptyCartState.items).toEqual([]);
  expect(cartReducer(emptyCartState, { type: 'remove', id: 'missing' }).items).toEqual([]);
  expect(selectCartItemCount([])).toBe(0);
  expect(selectCartTotal([])).toBe(0);
});

test('copies the selection snapshot so later source changes cannot change its price or choices', () => {
  const input = {
    ...selection,
    color: { name: 'Black' },
    storage: { capacity: '256 GB' },
  };
  const line = createCartLine('first', input);
  input.color.name = 'Red';
  input.storage.capacity = '128 GB';
  input.unitPrice = 999;
  expect(line).toMatchObject({
    color: { name: 'Black' },
    storage: { capacity: '256 GB' },
    unitPrice: 550,
  });
});

test.each([NaN, Infinity, -Infinity])('rejects nonfinite selection price %s', (unitPrice) => {
  expect(() => createCartLine('first', { ...selection, unitPrice })).toThrow('incomplete cart selection');
});
