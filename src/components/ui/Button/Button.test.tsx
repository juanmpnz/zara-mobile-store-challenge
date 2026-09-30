import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';
import { Button } from './Button';

test.each(['primary', 'secondary'] as const)('renders an accessible native %s button with safe default type', (variant) => {
  render(<Button variant={variant}>Continue</Button>);
  const button = screen.getByRole('button', { name: 'Continue' });
  expect(button.tagName).toBe('BUTTON');
  expect(button).toHaveAttribute('type', 'button');
});

test('supports an explicit submit type and accessible name', () => {
  render(
    <Button type="submit" aria-label="Save selection">
      Save
    </Button>,
  );
  expect(screen.getByRole('button', { name: 'Save selection' })).toHaveAttribute('type', 'submit');
});

test('invokes clicks while enabled', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(<Button onClick={onClick}>Continue</Button>);
  await user.click(screen.getByRole('button', { name: 'Continue' }));
  expect(onClick).toHaveBeenCalledTimes(1);
});

test('disables the native control and prevents clicks', async () => {
  const user = userEvent.setup();
  const onClick = vi.fn();
  render(
    <Button disabled onClick={onClick}>
      Continue
    </Button>,
  );
  const button = screen.getByRole('button', { name: 'Continue' });
  expect(button).toBeDisabled();
  await user.click(button);
  expect(onClick).not.toHaveBeenCalled();
});
