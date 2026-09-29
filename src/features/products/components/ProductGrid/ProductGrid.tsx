import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';

import styles from './ProductGrid.module.scss';

export interface ProductGridProps {
  products: readonly ProductSummary[];
  label?: string;
}

function hasUsableId(product: ProductSummary): product is ProductSummary & {
  id: string;
} {
  return typeof product.id === 'string' && product.id.trim().length > 0;
}

export function ProductGrid({
  products,
  label = 'Products',
}: ProductGridProps) {
  const identifiedProducts = products.filter(hasUsableId);

  return (
    <ul className={styles.grid} aria-label={label}>
      {identifiedProducts.map((product) => (
        <li className={styles.item} key={product.id.trim()}>
          <ProductCard className={styles.gridCard} product={product} />
        </li>
      ))}
    </ul>
  );
}
