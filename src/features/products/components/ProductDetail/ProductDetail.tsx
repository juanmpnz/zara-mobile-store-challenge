import { Link, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import backArrow from '@/assets/back-arrow.svg';
import { Button } from '@/components/ui/Button/Button';
import { useCartActions } from '@/features/cart/context/cartContext';
import { ApiError } from '@/lib/api/ApiError';
import { ColorSelector } from '@/features/products/components/ColorSelector/ColorSelector';
import { ProductImage } from '@/features/products/components/ProductImage/ProductImage';
import { SimilarProducts } from '@/features/products/components/SimilarProducts/SimilarProducts';
import { SpecificationsTable } from '@/features/products/components/SpecificationsTable/SpecificationsTable';
import { StorageSelector } from '@/features/products/components/StorageSelector/StorageSelector';
import type { ProductDetail as ProductDetailModel } from '@/features/products/model/product';
import { formatPrice } from '@/features/products/presentation/formatPrice';
import { useProductQuery } from '@/features/products/queries/productQueries';

import styles from './ProductDetail.module.scss';

interface ProductDetailProps {
  productId: string;
}

function validPrice(value: number | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function ProductDetailContent({ product }: { product: ProductDetailModel }) {
  const { addItem } = useCartActions();
  const navigate = useNavigate();
  const [storageCapacity, setStorageCapacity] = useState('');
  const [colorName, setColorName] = useState('');
  const storage = product.storageOptions?.find((item) => item.capacity?.trim() === storageCapacity);
  const color = product.colors?.find((item) => item.name?.trim() === colorName);
  const initialImage = product.colors?.find((item) => item.image?.trim())?.image?.trim();
  const selectedColorImage = color?.image?.trim();
  const image = selectedColorImage || initialImage;
  const name = product.name?.trim();
  const productId = product.id?.trim();
  const selectedPrice = storage?.price;
  const displayPrice = validPrice(selectedPrice)
    ? formatPrice(selectedPrice)
    : validPrice(product.basePrice)
      ? `From ${formatPrice(product.basePrice)}`
      : 'Price unavailable';
  const canAdd = Boolean(productId && name && storageCapacity && colorName && validPrice(selectedPrice));

  function addToCart() {
    if (!canAdd || !productId || !name || !storage || !color || !validPrice(selectedPrice)) return;
    const selectedImage = color.image?.trim();
    addItem({
      productId,
      name,
      ...(selectedImage ? { image: selectedImage } : {}),
      color: {
        name: colorName,
        ...(color.hex?.trim() ? { hex: color.hex.trim() } : {}),
      },
      storage: { capacity: storageCapacity },
      unitPrice: selectedPrice,
    });
    void navigate({ to: '/cart' });
  }

  return (
    <article className={styles.detail}>
      <Link className={styles.back} to="/">
        <img className={styles.backArrow} src={backArrow} alt="" />
        <span>BACK</span>
      </Link>
      <div className={styles.hero}>
        <ProductImage image={image} productName={name} colorName={selectedColorImage ? color?.name : undefined} />
        <div className={styles.configuration}>
          <header className={styles.summary}>
            <h1>{name || 'Unnamed product'}</h1>
            <p>{displayPrice}</p>
          </header>
          <StorageSelector options={product.storageOptions ?? []} value={storageCapacity} onValueChange={setStorageCapacity} />
          <ColorSelector options={product.colors ?? []} value={colorName} onValueChange={setColorName} />
          <Button className={styles.add} size="large" disabled={!canAdd} onClick={addToCart}>
            ADD
          </Button>
        </div>
      </div>
      <SpecificationsTable product={product} />
      <SimilarProducts products={product.similarProducts ?? []} />
    </article>
  );
}

export function ProductDetail({ productId }: ProductDetailProps) {
  const query = useProductQuery(productId);

  if (query.isPending) {
    return (
      <div className={styles.state} role="status">
        Loading product…
      </div>
    );
  }

  if (query.error) {
    if (query.error instanceof ApiError && query.error.status === 404) {
      return (
        <section className={styles.state}>
          <h1>Product not found.</h1>
          <Link to="/">Back to catalog</Link>
        </section>
      );
    }
    return (
      <section className={styles.state} role="alert">
        <h1>We could not load this product.</h1>
        <Button variant="secondary" onClick={() => void query.refetch()}>
          Try again
        </Button>
      </section>
    );
  }

  return <ProductDetailContent key={productId} product={query.data} />;
}
