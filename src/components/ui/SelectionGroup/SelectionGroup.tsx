import * as RadioGroup from '@radix-ui/react-radio-group';
import { forwardRef, type ComponentPropsWithoutRef, type ElementRef, type ReactNode } from 'react';

import styles from './SelectionGroup.module.scss';

export interface SelectionGroupRootProps {
  children: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  orientation?: 'horizontal' | 'vertical';
  required?: boolean;
}

type SelectionGroupItemContent = { children: ReactNode; label?: string } | { children?: never; label: string };

type RadixItemProps = Omit<ComponentPropsWithoutRef<typeof RadioGroup.Item>, 'aria-label' | 'children' | 'className' | 'value'>;

export type SelectionGroupItemProps = RadixItemProps &
  SelectionGroupItemContent & {
    value: string;
    className?: string;
  };

export const SelectionGroupRoot = forwardRef<ElementRef<typeof RadioGroup.Root>, SelectionGroupRootProps>(function SelectionGroupRoot(
  { children, className, disabled = false, label, name, onValueChange, orientation = 'horizontal', required = false, value },
  ref,
) {
  const classes = [styles.root, className].filter(Boolean).join(' ');

  return (
    <RadioGroup.Root
      ref={ref}
      className={classes}
      aria-label={label}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      name={name}
      orientation={orientation}
      required={required}
    >
      {children}
    </RadioGroup.Root>
  );
});

export const SelectionGroupItem = forwardRef<ElementRef<typeof RadioGroup.Item>, SelectionGroupItemProps>(function SelectionGroupItem(
  { children, className, label, value, ...itemProps },
  ref,
) {
  const classes = [styles.item, className].filter(Boolean).join(' ');

  return (
    <RadioGroup.Item {...itemProps} ref={ref} className={classes} aria-label={label} value={value}>
      {children}
    </RadioGroup.Item>
  );
});
