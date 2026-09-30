import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';
import { getProductEntries } from '@/features/products/presentation/productIdentity';
import { useSimilarProductsRail } from './useSimilarProductsRail';

import styles from './SimilarProducts.module.scss';

interface SimilarProductsProps {
  products: readonly ProductSummary[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const entries = getProductEntries(products);
  const {
    finishDragging,
    finishScrollbarDragging,
    handlePointerDown,
    handlePointerMove,
    handleScrollbarPointerDown,
    handleScrollbarPointerMove,
    indicator,
    isDragging,
    isScrollbarDragging,
    railRef,
    scrollbarRef,
    suppressDraggedLink,
  } = useSimilarProductsRail(products);
  if (products.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby="similar-heading">
      <h2 id="similar-heading" className={styles.heading}>
        SIMILAR ITEMS
      </h2>
      <ul
        ref={railRef}
        className={styles.rail}
        aria-label="Similar products"
        data-dragging={isDragging || undefined}
        onClickCapture={suppressDraggedLink}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
      >
        {entries.map((entry) => (
          <li className={styles.item} key={entry.key}>
            <ProductCard product={entry.product} />
          </li>
        ))}
      </ul>
      <div
        ref={scrollbarRef}
        className={styles.scrollbar}
        aria-hidden="true"
        data-dragging={isScrollbarDragging || undefined}
        onPointerDown={handleScrollbarPointerDown}
        onPointerMove={handleScrollbarPointerMove}
        onPointerUp={finishScrollbarDragging}
        onPointerCancel={finishScrollbarDragging}
      >
        <span className={styles.scrollbarThumb} style={{ left: `${indicator.left}%`, width: `${indicator.width}%` }} />
      </div>
    </section>
  );
}
