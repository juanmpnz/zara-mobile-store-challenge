export interface AddCartItem {
  productId: string;
  name: string;
  image?: string;
  color: {
    name: string;
    hex?: string;
  };
  storage: {
    capacity: string;
  };
  unitPrice: number;
}

export interface CartLine extends AddCartItem {
  id: string;
}

export interface CartState {
  items: readonly CartLine[];
}

export type CartAction =
  | { type: 'add'; item: CartLine }
  | { type: 'remove'; id: string }
  | { type: 'clear' };

export const emptyCartState: CartState = { items: [] };

function isNonemptyString(value: string): boolean {
  return value.trim().length > 0;
}

export function createCartLine(id: string, item: AddCartItem): CartLine {
  if (
    !isNonemptyString(id) ||
    !isNonemptyString(item.productId) ||
    !isNonemptyString(item.name) ||
    !isNonemptyString(item.color.name) ||
    !isNonemptyString(item.storage.capacity) ||
    !Number.isFinite(item.unitPrice)
  ) {
    throw new Error('Cannot add an incomplete cart selection.');
  }

  return {
    id,
    productId: item.productId,
    name: item.name,
    ...(item.image === undefined ? {} : { image: item.image }),
    color: {
      name: item.color.name,
      ...(item.color.hex === undefined ? {} : { hex: item.color.hex }),
    },
    storage: { capacity: item.storage.capacity },
    unitPrice: item.unitPrice,
  };
}

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'add':
      return { items: [...state.items, action.item] };
    case 'remove': {
      const items = state.items.filter((item) => item.id !== action.id);
      return items.length === state.items.length ? state : { items };
    }
    case 'clear':
      return state.items.length === 0 ? state : emptyCartState;
  }
}

export function selectCartItemCount(items: readonly CartLine[]): number {
  return items.length;
}

export function selectCartTotal(items: readonly CartLine[]): number {
  return items.reduce((total, item) => total + item.unitPrice, 0);
}
