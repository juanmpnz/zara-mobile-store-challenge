import { type ComponentPropsWithoutRef } from 'react';

import styles from './PageContainer.module.scss';

export type PageContainerProps = ComponentPropsWithoutRef<'div'>;

export function PageContainer({ className, ...containerProps }: PageContainerProps) {
  const classes = [styles.container, className].filter(Boolean).join(' ');

  return <div className={classes} {...containerProps} />;
}
