import { useMemo } from 'react';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';
import { getProductEntries } from '@/features/products/presentation/productIdentity';
import { useProductGridLayoutAnimation } from './useProductGridLayoutAnimation';

import styles from './ProductGrid.module.scss';

export interface ProductGridProps {
  products: readonly ProductSummary[];
  label?: string;
}

export function ProductGrid({ products, label = 'Products' }: ProductGridProps) {
  const entries = useMemo(() => getProductEntries(products), [products]);
  const { overlayRef, regionRef, setItemRef } = useProductGridLayoutAnimation(entries);

  return (
    <div ref={regionRef} className={styles.region} data-product-grid-region="">
      <ul className={styles.grid} aria-label={label}>
        {entries.map((entry) => (
          <li ref={(node) => setItemRef(entry.key, node)} className={styles.item} data-product-layout-key={entry.key} key={entry.key}>
            <ProductCard className={styles.gridCard} product={entry.product} />
          </li>
        ))}
      </ul>
      <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />
    </div>
  );
}
