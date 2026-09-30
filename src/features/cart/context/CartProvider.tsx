import { useCallback, useEffect, useMemo, useReducer, type PropsWithChildren } from 'react';
import {
  cartReducer,
  createCartLine,
  selectCartItemCount,
  selectCartTotal,
  type AddCartItem,
  type CartState,
} from '@/features/cart/model/cart';
import { loadCart, saveCart } from '@/features/cart/storage/cartStorage';
import { CartContextBoundary, type CartActionsValue, type CartStateValue } from './cartContext';

function initializeCartState(): CartState {
  return { items: loadCart() };
}

export function CartProvider({ children }: PropsWithChildren) {
  const [cart, dispatch] = useReducer(cartReducer, undefined, initializeCartState);

  useEffect(() => {
    saveCart(cart.items);
  }, [cart.items]);

  const addItem = useCallback((item: AddCartItem) => {
    const cartLine = createCartLine(crypto.randomUUID(), item);
    dispatch({ type: 'add', item: cartLine });
  }, []);

  const removeItem = useCallback((id: string) => {
    dispatch({ type: 'remove', id });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'clear' });
  }, []);

  const state = useMemo<CartStateValue>(
    () => ({
      items: cart.items,
      itemCount: selectCartItemCount(cart.items),
      total: selectCartTotal(cart.items),
    }),
    [cart.items],
  );
  const actions = useMemo<CartActionsValue>(() => ({ addItem, removeItem, clearCart }), [addItem, removeItem, clearCart]);

  return (
    <CartContextBoundary state={state} actions={actions}>
      {children}
    </CartContextBoundary>
  );
}
