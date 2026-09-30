import { render, screen } from '@testing-library/react';
import { expect, test } from 'vitest';
import { StorageSelector } from '@/features/products/components/StorageSelector/StorageSelector';

test('disables storage options without a finite price', () => {
  render(
    <StorageSelector
      options={[{ capacity: '128 GB' }, { capacity: '256 GB', price: Number.POSITIVE_INFINITY }, { capacity: '512 GB', price: 799 }]}
      value=""
      onValueChange={() => undefined}
    />,
  );

  expect(screen.getByRole('radio', { name: '128 GB' })).toBeDisabled();
  expect(screen.getByRole('radio', { name: '256 GB' })).toBeDisabled();
  expect(screen.getByRole('radio', { name: '512 GB' })).toBeEnabled();
});
