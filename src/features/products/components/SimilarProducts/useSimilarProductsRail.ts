import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from 'react';

export function useSimilarProductsRail(products: readonly unknown[]) {
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
    const width = rail.scrollWidth > 0 ? Math.min(100, (rail.clientWidth / rail.scrollWidth) * 100) : 100;
    const progress = maximumScroll > 0 ? rail.scrollLeft / maximumScroll : 0;
    setIndicator({ left: progress * (100 - width), width });
  }

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;

    const update = () => syncIndicator(rail);
    update();
    rail.addEventListener('scroll', update, { passive: true });
    const resizeObserver = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update);
    resizeObserver?.observe(rail);
    window.addEventListener('resize', update);
    return () => {
      rail.removeEventListener('scroll', update);
      resizeObserver?.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [products]);

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
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
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
    rail.scrollLeft = scrollbarStartScroll.current + distance * (maximumScroll / availableTravel);
    syncIndicator(rail);
  }

  function finishScrollbarDragging(event: PointerEvent<HTMLDivElement>) {
    if (!scrollbarDragging.current) return;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    scrollbarDragging.current = false;
    setIsScrollbarDragging(false);
  }

  function suppressDraggedLink(event: MouseEvent<HTMLUListElement>) {
    if (!suppressClick.current) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClick.current = false;
  }

  return {
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
  };
}
