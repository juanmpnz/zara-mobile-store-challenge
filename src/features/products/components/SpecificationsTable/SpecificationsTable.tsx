import type { ProductDetail } from '@/features/products/model/product';

import styles from './SpecificationsTable.module.scss';

interface SpecificationsTableProps {
  product: ProductDetail;
}

interface SpecificationRowProps {
  label: string;
  value: string;
}

export function SpecificationRow({ label, value }: SpecificationRowProps) {
  return (
    <div className={styles.row}>
      <dt className={styles.term}>{label}</dt>
      <dd className={styles.description}>{value}</dd>
    </div>
  );
}

export function SpecificationsTable({ product }: SpecificationsTableProps) {
  const rows = [
    ['BRAND', product.brand],
    ['NAME', product.name],
    ['DESCRIPTION', product.description],
    ['SCREEN', product.specifications?.screen],
    ['RESOLUTION', product.specifications?.resolution],
    ['PROCESSOR', product.specifications?.processor],
    ['MAIN CAMERA', product.specifications?.mainCamera],
    ['SELFIE CAMERA', product.specifications?.selfieCamera],
    ['BATTERY', product.specifications?.battery],
    ['OS', product.specifications?.operatingSystem],
    ['SCREEN REFRESH RATE', product.specifications?.screenRefreshRate],
  ].filter((row): row is [string, string] => Boolean(row[1]?.trim()));

  if (rows.length === 0) return null;
  return (
    <section className={styles.section} aria-labelledby="specifications-heading">
      <h2 id="specifications-heading" className={styles.heading}>
        SPECIFICATIONS
      </h2>
      <dl className={styles.list}>
        {rows.map(([label, value]) => (
          <SpecificationRow key={label} label={label} value={value} />
        ))}
      </dl>
    </section>
  );
}
