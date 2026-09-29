import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { ProductSummary } from '@/features/products/model/product';
import { ProductCard } from '@/features/products/components/ProductCard/ProductCard';

import styles from './SimilarProducts.module.scss';

interface SimilarProductsProps {
  products: readonly ProductSummary[];
}

export function SimilarProducts({ products }: SimilarProductsProps) {
  const railRef = useRef<HTMLUListElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartScroll = useRef(0);
  const dragging = useRef(false);
  const suppressClick = useRef(false);
  const scrollbarDragging = useRef(false);
  const scrollbarStartX = useRef(0);
  const scrollbarStartScroll = useRef(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isScrollbarDragging, setIsScrollbarDragging] = useState(false);
  const [indicator, setIndicator] = useState({ left: 0, width: 100 });

  function syncIndicator(rail: HTMLUListElement) {
    const maximumScroll = rail.scrollWidth - rail.clientWidth;
    const width =
      rail.scrollWidth > 0
        ? Math.min(100, (rail.clientWidth / rail.scrollWidth) * 100)
        : 100;
    const progress = maximumScroll > 0 ? rail.scrollLeft / maximumScroll : 0;
    setIndicator({ left: progress * (100 - width), width });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    const update = () => syncIndicator(rail);
    update();
    rail.addEventListener('scroll', update, { passive: true });
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? undefined
        : new ResizeObserver(update);
    resizeObserver?.observe(rail);
    window.addEventListener('resize', update);
    return () => {
      rail.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [products]);

  if (products.length === 0) return null;

  function handlePointerDown(event: PointerEvent<HTMLUListElement>) {
    if (event.button !== 0 || event.pointerType === 'touch') return;
    dragStartX.current = event.clientX;
    dragStartScroll.current = event.currentTarget.scrollLeft;
    dragging.current = true;
    suppressClick.current = false;
  }

  function handlePointerMove(event: PointerEvent<HTMLUListElement>) {
    if (!dragging.current) return;
    const distance = event.clientX - dragStartX.current;
    if (Math.abs(distance) > 4 && !suppressClick.current) {
      suppressClick.current = true;
      setIsDragging(true);
      event.currentTarget.setPointerCapture?.(event.pointerId);
    }
    if (!suppressClick.current) return;
    event.currentTarget.scrollLeft = dragStartScroll.current - distance;
    syncIndicator(event.currentTarget);
  }

  function finishDragging(event: PointerEvent<HTMLUListElement>) {
    if (!dragging.current) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragging.current = false;
    setIsDragging(false);
  }

  function handleScrollbarPointerDown(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || event.pointerType === 'touch') return;
    const rail = railRef.current;
    if (!rail || rail.scrollWidth <= rail.clientWidth) return;
    scrollbarDragging.current = true;
    scrollbarStartX.current = event.clientX;
    scrollbarStartScroll.current = rail.scrollLeft;
    setIsScrollbarDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handleScrollbarPointerMove(event: PointerEvent<HTMLDivElement>) {
    const rail = railRef.current;
    const scrollbar = scrollbarRef.current;
    if (!scrollbarDragging.current || !rail || !scrollbar) return;
    const maximumScroll = rail.scrollWidth - rail.clientWidth;
    const thumbWidth = scrollbar.clientWidth * (indicator.width / 100);
    const availableTravel = scrollbar.clientWidth - thumbWidth;
    if (maximumScroll <= 0 || availableTravel <= 0) return;
    const distance = event.clientX - scrollbarStartX.current;
    rail.scrollLeft =
      scrollbarStartScroll.current +
      distance * (maximumScroll / availableTravel);
    syncIndicator(rail);
  }

  function finishScrollbarDragging(event: PointerEvent<HTMLDivElement>) {
    if (!scrollbarDragging.current) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    scrollbarDragging.current = false;
    setIsScrollbarDragging(false);
  }

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
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          event.preventDefault();
          event.stopPropagation();
          suppressClick.current = false;
        }}
        onDragStart={(event) => event.preventDefault()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDragging}
        onPointerCancel={finishDragging}
      >
        {products.map((product) => (
          <li
            className={styles.item}
            key={[
              product.id,
              product.brand,
              product.name,
              product.basePrice,
              product.image,
            ].join('|')}
          >
            <ProductCard product={product} />
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
        <span
          className={styles.scrollbarThumb}
          style={{ left: `${indicator.left}%`, width: `${indicator.width}%` }}
        />
      </div>
    </section>
  );
}
