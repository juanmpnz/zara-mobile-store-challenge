import {
  useCartActions,
  useCartState,
} from '@/features/cart/context/cartContext';
import { CartItem } from '@/features/cart/components/CartItem/CartItem';
import { CartSummary } from '@/features/cart/components/CartSummary/CartSummary';

import styles from './CartPage.module.scss';

export function CartPage() {
  const { items, itemCount, total } = useCartState();
  const { removeItem } = useCartActions();

  return (
    <section className={styles.page} aria-labelledby="cart-heading">
      <h1 id="cart-heading" className={styles.heading}>
        CART ({itemCount})
      </h1>
      {items.length > 0 ? (
        <ul className={styles.items} aria-label="Cart items">
          {items.map((item) => (
            <CartItem key={item.id} item={item} onRemove={removeItem} />
          ))}
        </ul>
      ) : null}
      <CartSummary total={items.length > 0 ? total : undefined} />
    </section>
  );
}
