import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { expect, test, vi } from 'vitest';
import { SelectionGroupItem, SelectionGroupRoot } from './SelectionGroup';

function SelectionHarness({
  disabled = false,
  onChange = () => undefined,
}: {
  disabled?: boolean;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState('128');
  return (
    <SelectionGroupRoot
      label="Storage"
      value={value}
      disabled={disabled}
      onValueChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    >
      <SelectionGroupItem value="128">128 GB</SelectionGroupItem>
      <SelectionGroupItem value="256">256 GB</SelectionGroupItem>
      <SelectionGroupItem value="512" disabled>
        512 GB
      </SelectionGroupItem>
    </SelectionGroupRoot>
  );
}

test('names the radio group and exposes its initial checked selection', () => {
  render(<SelectionHarness />);
  expect(screen.getByRole('radiogroup', { name: 'Storage' })).toBeVisible();
  expect(screen.getByRole('radio', { name: '128 GB' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '256 GB' })).not.toBeChecked();
});

test('updates the controlled selection through the public handler', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SelectionHarness onChange={onChange} />);
  await user.click(screen.getByRole('radio', { name: '256 GB' }));
  expect(onChange).toHaveBeenLastCalledWith('256');
  expect(screen.getByRole('radio', { name: '256 GB' })).toBeChecked();
  expect(screen.getByRole('radio', { name: '128 GB' })).not.toBeChecked();
});

test('supports arrow-key selection from the checked radio', async () => {
  const user = userEvent.setup();
  render(<SelectionHarness />);
  await user.tab();
  expect(screen.getByRole('radio', { name: '128 GB' })).toHaveFocus();
  await user.keyboard('{ArrowRight>}');
  await waitFor(() =>
    expect(screen.getByRole('radio', { name: '256 GB' })).toBeChecked(),
  );
  expect(screen.getByRole('radio', { name: '256 GB' })).toHaveFocus();
  await user.keyboard('{/ArrowRight}');
});

test('prevents selection of a disabled option', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SelectionHarness onChange={onChange} />);
  const disabled = screen.getByRole('radio', { name: '512 GB' });
  expect(disabled).toBeDisabled();
  await user.click(disabled);
  expect(disabled).not.toBeChecked();
  expect(onChange).not.toHaveBeenCalled();
});

test('disables all options when the group is disabled', async () => {
  const user = userEvent.setup();
  const onChange = vi.fn();
  render(<SelectionHarness disabled onChange={onChange} />);
  for (const radio of screen.getAllByRole('radio'))
    expect(radio).toBeDisabled();
  await user.click(screen.getByRole('radio', { name: '256 GB' }));
  expect(onChange).not.toHaveBeenCalled();
  expect(screen.getByRole('radio', { name: '128 GB' })).toBeChecked();
});
