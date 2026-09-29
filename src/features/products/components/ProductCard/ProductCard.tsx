import { Link } from '@tanstack/react-router';
import type { ProductSummary } from '@/features/products/model/product';
import { formatPrice } from '@/features/products/presentation/formatPrice';

import styles from './ProductCard.module.scss';

export interface ProductCardProps {
  product: ProductSummary;
  className?: string;
}

function getDisplayValue(value: string | undefined, fallback: string): string {
  const trimmedValue = value?.trim();
  return trimmedValue ? trimmedValue : fallback;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const productId = product.id?.trim();
  const brand = getDisplayValue(product.brand, 'Brand unavailable');
  const name = getDisplayValue(product.name, 'Unnamed product');
  const image = product.image?.trim();
  const price =
    typeof product.basePrice === 'number' && Number.isFinite(product.basePrice)
      ? formatPrice(product.basePrice)
      : 'Price unavailable';
  const imageAlt = product.brand?.trim() ? `${brand} ${name}` : `${name}`;
  const classes = [styles.card, className].filter(Boolean).join(' ');

  const content = (
    <>
      <div className={styles.imageArea}>
        {image ? (
          <img className={styles.image} src={image} alt={imageAlt} />
        ) : (
          <span className={styles.imageFallback}>Image unavailable</span>
        )}
      </div>
      <div className={styles.metadata}>
        <p className={styles.brand}>{brand}</p>
        <div className={styles.summary}>
          <p className={styles.name}>{name}</p>
          <p className={styles.price}>{price}</p>
        </div>
      </div>
    </>
  );

  return (
    <article className={classes}>
      {productId ? (
        <Link
          className={styles.link}
          to="/products/$productId"
          params={{ productId }}
        >
          {content}
        </Link>
      ) : (
        <div className={styles.content}>{content}</div>
      )}
    </article>
  );
}
