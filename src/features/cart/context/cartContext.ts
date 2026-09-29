import {
  createContext,
  createElement,
  useContext,
  type PropsWithChildren,
} from 'react';
import type { AddCartItem, CartLine } from '@/features/cart/model/cart';

export interface CartStateValue {
  items: readonly CartLine[];
  itemCount: number;
  total: number;
}

export interface CartActionsValue {
  addItem: (item: AddCartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

interface CartContextBoundaryProps extends PropsWithChildren {
  state: CartStateValue;
  actions: CartActionsValue;
}

const CartStateContext = createContext<CartStateValue | undefined>(undefined);
const CartActionsContext = createContext<CartActionsValue | undefined>(
  undefined,
);

export function CartContextBoundary({
  state,
  actions,
  children,
}: CartContextBoundaryProps) {
  return createElement(
    CartActionsContext.Provider,
    { value: actions },
    createElement(CartStateContext.Provider, { value: state }, children),
  );
}

export function useCartState(): CartStateValue {
  const value = useContext(CartStateContext);

  if (value === undefined) {
    throw new Error('useCartState must be used within CartProvider.');
  }

  return value;
}

export function useCartActions(): CartActionsValue {
  const value = useContext(CartActionsContext);

  if (value === undefined) {
    throw new Error('useCartActions must be used within CartProvider.');
  }

  return value;
}
