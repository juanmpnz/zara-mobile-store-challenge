import { forwardRef, type ComponentPropsWithoutRef } from 'react';

import styles from './Button.module.scss';

export type ButtonVariant = 'primary' | 'secondary';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, size = 'medium', type = 'button', variant = 'primary', ...buttonProps },
  ref,
) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(' ');

  return <button ref={ref} type={type} className={classes} {...buttonProps} />;
});
