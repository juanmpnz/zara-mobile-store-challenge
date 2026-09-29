interface ProductImageProps {
  image?: string;
  productName?: string;
  colorName?: string;
}

import styles from './ProductImage.module.scss';

export function ProductImage({
  image,
  productName,
  colorName,
}: ProductImageProps) {
  const source = image?.trim();
  const name = productName?.trim() || 'Product';
  const alt = colorName?.trim() ? `${name} in ${colorName}` : name;

  return (
    <div className={styles.frame}>
      {source ? (
        <img key={source} className={styles.image} src={source} alt={alt} />
      ) : (
        <span className={styles.fallback}>Image unavailable</span>
      )}
    </div>
  );
}
