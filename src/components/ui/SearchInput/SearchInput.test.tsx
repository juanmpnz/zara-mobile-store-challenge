import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { SearchInput } from './SearchInput';

function SearchHarness({
  initialValue = '',
  onChange = () => undefined,
  disabled = false,
}: {
  initialValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <SearchInput
      label="Search phones"
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

test('exposes the supplied accessible name and no clear control when empty', () => {
  render(<SearchHarness />);
  expect(screen.getByRole('searchbox', { name: 'Search phones' })).toHaveValue(
    '',
  );
  expect(
    screen.queryByRole('button', { name: 'Clear search' }),
  ).not.toBeInTheDocument();
});

test('emits typed values and displays the controlled value', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SearchHarness onChange={onChange} />);
  const input = screen.getByRole('searchbox', { name: 'Search phones' });
  await user.type(input, 'Phone');
  expect(input).toHaveValue('Phone');
  expect(onChange).toHaveBeenLastCalledWith('Phone');
});

test('shows its focus indicator only when reached with Tab', async () => {
  const user = userEvent.setup();
  render(<SearchHarness />);
  const input = screen.getByRole('searchbox', { name: 'Search phones' });

  await user.click(input);
  expect(input).not.toHaveAttribute('data-keyboard-focus');

  await user.tab({ shift: true });
  await user.tab();
  expect(input).toHaveAttribute('data-keyboard-focus', 'true');

  await user.click(input);
  expect(input).not.toHaveAttribute('data-keyboard-focus');
});

test('clears a filled search through its handler and restores input focus', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SearchHarness initialValue="Phone" onChange={onChange} />);
  await user.click(screen.getByRole('button', { name: 'Clear search' }));
  const input = screen.getByRole('searchbox', { name: 'Search phones' });
  expect(input).toHaveValue('');
  expect(input).toHaveFocus();
  expect(onChange).toHaveBeenLastCalledWith('');
  expect(
    screen.queryByRole('button', { name: 'Clear search' }),
  ).not.toBeInTheDocument();
});

test('disables typing and clearing', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SearchHarness initialValue="Phone" disabled onChange={onChange} />);
  const input = screen.getByRole('searchbox', { name: 'Search phones' });
  const clear = screen.getByRole('button', { name: 'Clear search' });
  expect(input).toBeDisabled();
  expect(clear).toBeDisabled();
  await user.type(input, 'New');
  await user.click(clear);
  expect(input).toHaveValue('Phone');
  expect(onChange).not.toHaveBeenCalled();
});

test('preserves read-only semantics by withholding the clear action', () => {
  const onChange = vi.fn();
  render(
    <SearchInput
      label="Search phones"
      value="Phone"
      readOnly
      onValueChange={onChange}
    />,
  );
  expect(screen.getByRole('searchbox', { name: 'Search phones' })).toHaveValue(
    'Phone',
  );
  expect(
    screen.queryByRole('button', { name: 'Clear search' }),
  ).not.toBeInTheDocument();
  expect(onChange).not.toHaveBeenCalled();
});
