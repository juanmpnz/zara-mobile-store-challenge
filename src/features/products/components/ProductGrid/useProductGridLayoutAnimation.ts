import { useLayoutEffect, useRef } from 'react';
import type { ProductEntry } from '@/features/products/presentation/productIdentity';

const LAYOUT_DURATION_MS = 420;
const LAYOUT_EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';

interface ItemSnapshot {
  clone: HTMLElement;
  rect: DOMRect;
}

interface LayoutSnapshot {
  height: number;
  items: Map<string, ItemSnapshot>;
  signature: string;
}

function motionIsReduced(): boolean {
  return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function relativeRect(element: HTMLElement, regionRect: DOMRect): DOMRect {
  const rect = element.getBoundingClientRect();
  return new DOMRect(rect.left - regionRect.left, rect.top - regionRect.top, rect.width, rect.height);
}

export function useProductGridLayoutAnimation(entries: readonly ProductEntry[]) {
  const signature = entries.map((entry) => entry.key).join('|');
  const regionRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());
  const snapshotRef = useRef<LayoutSnapshot>();
  const animationsRef = useRef<Animation[]>([]);

  useLayoutEffect(() => {
    const region = regionRef.current;
    const overlay = overlayRef.current;
    if (!region || !overlay) return;

    overlay.setAttribute('inert', '');
    const regionRect = region.getBoundingClientRect();
    const currentItems = new Map<string, ItemSnapshot>();

    for (const entry of entries) {
      const element = itemRefs.current.get(entry.key);
      if (element) currentItems.set(entry.key, { clone: element.cloneNode(true) as HTMLElement, rect: relativeRect(element, regionRect) });
    }

    const previous = snapshotRef.current;
    snapshotRef.current = { height: regionRect.height, items: currentItems, signature };
    if (!previous || previous.signature === signature || motionIsReduced() || typeof region.animate !== 'function') return;

    for (const animation of animationsRef.current) animation.cancel();
    animationsRef.current = [];
    overlay.replaceChildren();

    const animationOptions: KeyframeAnimationOptions = { duration: LAYOUT_DURATION_MS, easing: LAYOUT_EASING };
    const nextKeys = new Set(currentItems.keys());

    for (const [key, currentItem] of currentItems) {
      const element = itemRefs.current.get(key);
      if (!element) continue;

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
      if (nextKeys.has(key)) continue;

      const ghost = previousItem.clone;
      ghost.removeAttribute('data-product-layout-key');
      ghost.setAttribute('aria-hidden', 'true');
      Object.assign(ghost.style, {
        position: 'absolute',
        inset: 'auto',
        top: `${previousItem.rect.top}px`,
        left: `${previousItem.rect.left}px`,
        width: `${previousItem.rect.width}px`,
        height: `${previousItem.rect.height}px`,
        pointerEvents: 'none',
      });
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
      for (const animation of animationsRef.current) animation.cancel();
    },
    [],
  );

  function setItemRef(key: string, node: HTMLLIElement | null) {
    if (node) itemRefs.current.set(key, node);
    else itemRefs.current.delete(key);
  }

  return { overlayRef, regionRef, setItemRef };
}
