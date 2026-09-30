import { useLayoutEffect, useMemo, useRef } from 'react';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';

import styles from './ProductGrid.module.scss';

const LAYOUT_DURATION_MS = 420;
const LAYOUT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

export interface ProductGridProps {
  products: readonly ProductSummary[];
  label?: string;
}

interface ProductEntry {
  key: string;
  product: ProductSummary;
}

interface ItemSnapshot {
  clone: HTMLElement;
  rect: DOMRect;
}

interface LayoutSnapshot {
  height: number;
  items: Map<string, ItemSnapshot>;
  signature: string;
}

function getProductIdentity(product: ProductSummary): string {
  const productId = product.id?.trim();

  if (productId) {
    return `id:${productId}`;
  }

  return ['unidentified', product.brand?.trim(), product.name?.trim(), product.basePrice, product.image?.trim()].join(':');
}

function getProductEntries(products: readonly ProductSummary[]): ProductEntry[] {
  const occurrences = new Map<string, number>();

  return products.map((product) => {
    const identity = getProductIdentity(product);
    const occurrence = occurrences.get(identity) ?? 0;
    occurrences.set(identity, occurrence + 1);

    return { key: `${identity}:${occurrence}`, product };
  });
}

function motionIsReduced(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function relativeRect(element: HTMLElement, regionRect: DOMRect): DOMRect {
  const rect = element.getBoundingClientRect();

  return new DOMRect(rect.left - regionRect.left, rect.top - regionRect.top, rect.width, rect.height);
}

export function ProductGrid({ products, label = 'Products' }: ProductGridProps) {
  const entries = useMemo(() => getProductEntries(products), [products]);
  const signature = entries.map((entry) => entry.key).join('|');
  const regionRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const snapshotRef = useRef<LayoutSnapshot>();
  const animationsRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const region = regionRef.current;
    const overlay = overlayRef.current;

    if (!region || !overlay) {
      return;
    }

    overlay.setAttribute('inert', '');

    const regionRect = region.getBoundingClientRect();
    const currentItems = new Map<string, ItemSnapshot>();

    for (const entry of entries) {
      const element = itemRefs.current.get(entry.key);

      if (element) {
        currentItems.set(entry.key, {
          clone: element.cloneNode(true) as HTMLElement,
          rect: relativeRect(element, regionRect),
        });
      }
    }

    const previous = snapshotRef.current;
    snapshotRef.current = {
      height: regionRect.height,
      items: currentItems,
      signature,
    };

    if (!previous || previous.signature === signature || motionIsReduced() || typeof region.animate !== 'function') {
      return;
    }

    for (const animation of animationsRef.current) {
      animation.cancel();
    }
    animationsRef.current = [];
    overlay.replaceChildren();

    const animationOptions: KeyframeAnimationOptions = {
      duration: LAYOUT_DURATION_MS,
      easing: LAYOUT_EASING,
    };
    const nextKeys = new Set(currentItems.keys());

    for (const [key, currentItem] of currentItems) {
      const element = itemRefs.current.get(key);

      if (!element) {
        continue;
      }

      const previousItem = previous.items.get(key);

      if (!previousItem) {
        animationsRef.current.push(element.animate([{ opacity: 0 }, { opacity: 1 }], animationOptions));
        continue;
      }

      const deltaX = previousItem.rect.left - currentItem.rect.left;
      const deltaY = previousItem.rect.top - currentItem.rect.top;

      if (deltaX !== 0 || deltaY !== 0) {
        animationsRef.current.push(
          element.animate([{ transform: `translate(${deltaX}px, ${deltaY}px)` }, { transform: 'translate(0, 0)' }], animationOptions),
        );
      }
    }

    for (const [key, previousItem] of previous.items) {
      if (nextKeys.has(key)) {
        continue;
      }

      const ghost = previousItem.clone;
      ghost.removeAttribute('data-product-layout-key');
      ghost.setAttribute('aria-hidden', 'true');
      ghost.style.position = 'absolute';
      ghost.style.inset = 'auto';
      ghost.style.top = `${previousItem.rect.top}px`;
      ghost.style.left = `${previousItem.rect.left}px`;
      ghost.style.width = `${previousItem.rect.width}px`;
      ghost.style.height = `${previousItem.rect.height}px`;
      ghost.style.pointerEvents = 'none';
      overlay.appendChild(ghost);

      const animation = ghost.animate([{ opacity: 1 }, { opacity: 0 }], animationOptions);
      animationsRef.current.push(animation);
      void animation.finished.then(
        () => ghost.remove(),
        () => ghost.remove(),
      );
    }

    if (previous.height !== regionRect.height) {
      animationsRef.current.push(
        region.animate([{ height: `${previous.height}px` }, { height: `${regionRect.height}px` }], animationOptions),
      );
    }
  }, [entries, signature]);

  useLayoutEffect(
    () => () => {
      for (const animation of animationsRef.current) {
        animation.cancel();
      }
    },
    [],
  );

  return (
    <div ref={regionRef} className={styles.region} data-product-grid-region="">
      <ul className={styles.grid} aria-label={label}>
        {entries.map((entry) => (
          <li
            ref={(node) => {
              if (node) {
                itemRefs.current.set(entry.key, node);
              } else {
                itemRefs.current.delete(entry.key);
              }
            }}
            className={styles.item}
            data-product-layout-key={entry.key}
            key={entry.key}
          >
            <ProductCard className={styles.gridCard} product={entry.product} />
          </li>
        ))}
      </ul>
      <div ref={overlayRef} className={styles.overlay} aria-hidden="true" />
    </div>
  );
}
