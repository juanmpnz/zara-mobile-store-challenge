import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { loadCart, saveCart } from './cartStorage';

const key = 'zara-mobile-store:cart:v1';
const line = {
  id: 'line-1',
  productId: 'phone',
  name: 'Phone',
  image: '/phone.webp',
  color: { name: 'Black', hex: '#000000' },
  storage: { capacity: '256 GB' },
  unitPrice: 550,
};
beforeEach(() => localStorage.clear());
afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

test('missing storage returns an empty cart', () => {
  expect(loadCart()).toEqual([]);
});
test('hydrates a valid versioned snapshot', () => {
  localStorage.setItem(key, JSON.stringify({ version: 1, items: [line] }));
  expect(loadCart()).toEqual([line]);
});
test.each([
  '{broken',
  JSON.stringify({ version: 2, items: [line] }),
  JSON.stringify({ version: 1, items: {} }),
  JSON.stringify({
    version: 1,
    items: [line, { ...line, id: 'bad', color: null }],
  }),
  JSON.stringify({ version: 1, items: [line, line] }),
  JSON.stringify({ version: 1, items: [{ ...line, unitPrice: null }] }),
  JSON.stringify({ version: 1, items: [{ ...line, productId: ' ' }] }),
  JSON.stringify({ version: 1, items: [{ ...line, image: 42 }] }),
  '{"version":1,"items":[{"id":"x","productId":"p","name":"P","color":{"name":"Black"},"storage":{"capacity":"256 GB"},"unitPrice":1e400}]}',
])('rejects the entire invalid persisted cart %#', (serialized) => {
  localStorage.setItem(key, serialized);
  expect(loadCart()).toEqual([]);
});
test('serializes and hydrates only allowlisted snapshot fields', () => {
  const oversized = {
    ...line,
    specifications: { os: 'OS' },
    similarProducts: [],
    total: 999,
    count: 99,
    color: { ...line.color, serverMetadata: 'ignored' },
  };
  saveCart([oversized]);
  expect(JSON.parse(localStorage.getItem(key) ?? '')).toEqual({
    version: 1,
    items: [line],
  });
  localStorage.setItem(key, JSON.stringify({ version: 1, items: [oversized] }));
  expect(loadCart()).toEqual([line]);
});
test('recovers from storage getter failures', () => {
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw new Error('denied');
  });
  expect(loadCart()).toEqual([]);
  expect(() => saveCart([line])).not.toThrow();
});
test('recovers from storage read and write failures', () => {
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('denied');
  });
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('quota');
  });
  expect(loadCart()).toEqual([]);
  expect(() => saveCart([line])).not.toThrow();
});
