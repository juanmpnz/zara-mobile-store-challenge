import type { ProductSummary } from '@/features/products/model/product';

export interface ProductEntry {
  key: string;
  product: ProductSummary;
}

function getProductIdentity(product: ProductSummary): string {
  const productId = product.id?.trim();
  if (productId) return `id:${productId}`;

  return ['unidentified', product.brand?.trim(), product.name?.trim(), product.basePrice, product.image?.trim()].join(':');
}

export function getProductEntries(products: readonly ProductSummary[]): ProductEntry[] {
  const occurrences = new Map<string, number>();

  return products.map((product) => {
    const identity = getProductIdentity(product);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);
    return { key: `${identity}:${occurrence}`, product };
  });
}
