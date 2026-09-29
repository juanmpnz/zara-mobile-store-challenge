import type { CartLine } from '@/features/cart/model/cart';

const CART_STORAGE_KEY = 'zara-mobile-store:cart:v1';
const CART_STORAGE_VERSION = 1;

function getStorage(): Storage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonemptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function parseCartLine(value: unknown): CartLine | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const color = value.color;
  const storage = value.storage;

  if (
    !isRecord(color) ||
    !isRecord(storage) ||
    !isNonemptyString(value.id) ||
    !isNonemptyString(value.productId) ||
    !isNonemptyString(value.name) ||
    !isOptionalString(value.image) ||
    !isNonemptyString(color.name) ||
    !isOptionalString(color.hex) ||
    !isNonemptyString(storage.capacity) ||
    typeof value.unitPrice !== 'number' ||
    !Number.isFinite(value.unitPrice)
  ) {
    return undefined;
  }

  return {
    id: value.id,
    productId: value.productId,
    name: value.name,
    ...(value.image === undefined ? {} : { image: value.image }),
    color: {
      name: color.name,
      ...(color.hex === undefined ? {} : { hex: color.hex }),
    },
    storage: { capacity: storage.capacity },
    unitPrice: value.unitPrice,
  };
}

export function loadCart(): CartLine[] {
  try {
    const serialized = getStorage()?.getItem(CART_STORAGE_KEY);

    if (serialized === undefined || serialized === null) {
      return [];
    }

    const persisted: unknown = JSON.parse(serialized);

    if (
      !isRecord(persisted) ||
      persisted.version !== CART_STORAGE_VERSION ||
      !Array.isArray(persisted.items)
    ) {
      return [];
    }

    const cartLines: CartLine[] = [];

    for (const persistedItem of persisted.items) {
      const cartLine = parseCartLine(persistedItem);

      if (cartLine === undefined) {
        return [];
      }

      cartLines.push(cartLine);
    }

    const ids = new Set(cartLines.map((item) => item.id));

    return ids.size === cartLines.length ? cartLines : [];
  } catch {
    return [];
  }
}

export function saveCart(items: readonly CartLine[]): void {
  try {
    const persistedItems = items.map((item) => ({
      id: item.id,
      productId: item.productId,
      name: item.name,
      ...(item.image === undefined ? {} : { image: item.image }),
      color: {
        name: item.color.name,
        ...(item.color.hex === undefined ? {} : { hex: item.color.hex }),
      },
      storage: { capacity: item.storage.capacity },
      unitPrice: item.unitPrice,
    }));
    const serialized = JSON.stringify({
      version: CART_STORAGE_VERSION,
      items: persistedItems,
    });

    getStorage()?.setItem(CART_STORAGE_KEY, serialized);
  } catch {
    // Persistence is best-effort; the in-memory cart remains usable.
  }
}
