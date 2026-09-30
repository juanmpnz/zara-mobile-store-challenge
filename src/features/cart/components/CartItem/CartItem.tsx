import type { CartLine } from '@/features/cart/model/cart';
import { formatPrice } from '@/features/products/presentation/formatPrice';

import styles from './CartItem.module.scss';

interface CartItemProps {
  item: CartLine;
  onRemove: (lineId: string) => void;
}

export function CartItem({ item, onRemove }: CartItemProps) {
  return (
    <li className={styles.item}>
      <div className={styles.imageFrame}>
        {item.image ? (
          <img className={styles.image} src={item.image} alt={`${item.name}, ${item.color.name}`} />
        ) : (
          <span className={styles.imageFallback} aria-hidden="true">
            IMAGE UNAVAILABLE
          </span>
        )}
      </div>
      <div className={styles.details}>
        <div>
          <h2 className={styles.name}>{item.name}</h2>
          <p className={styles.selection}>
            {item.storage.capacity} | {item.color.name}
          </p>
        </div>
        <p className={styles.price}>{formatPrice(item.unitPrice)}</p>
        <button className={styles.remove} type="button" onClick={() => onRemove(item.id)} aria-label={`Eliminar ${item.name} del carrito`}>
          Eliminar
        </button>
      </div>
    </li>
  );
}
