import { expect, test } from 'vitest';
import { getProductEntries } from './productIdentity';

test('uses product ids as the primary stable identity', () => {
  const [entry] = getProductEntries([{ id: '  phone-1  ', name: 'Phone' }]);

  expect(entry?.key).toBe('id:phone-1:0');
});

test('builds deterministic collision-safe identities when ids are missing or duplicated', () => {
  const unidentifiedProduct = { brand: 'Brand', name: 'Phone', basePrice: 499, image: '/phone.png' };
  const entries = getProductEntries([
    unidentifiedProduct,
    { ...unidentifiedProduct },
    { id: 'phone-1', name: 'Phone' },
    { id: 'phone-1', name: 'Phone duplicate' },
  ]);

  expect(entries.map(({ key }) => key)).toEqual([
    'unidentified:Brand:Phone:499:/phone.png:0',
    'unidentified:Brand:Phone:499:/phone.png:1',
    'id:phone-1:0',
    'id:phone-1:1',
  ]);
});
