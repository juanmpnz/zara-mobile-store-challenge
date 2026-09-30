import { Link } from '@tanstack/react-router';
import filledBag from '@/assets/bag-filled.svg';
import mbstLogo from '@/assets/mbst-logo.svg';
import { useCartState } from '@/features/cart/context/cartContext';
import { PageContainer } from '@/app/layout/PageContainer/PageContainer';

import styles from './Header.module.scss';

export function Header() {
  const { itemCount } = useCartState();
  const itemLabel = itemCount === 1 ? 'item' : 'items';

  return (
    <header className={styles.header}>
      <PageContainer className={styles.inner}>
        <Link className={styles.brand} to="/" aria-label="MBST home">
          <img className={styles.logo} src={mbstLogo} alt="" />
        </Link>
        <nav aria-label="Cart navigation">
          <Link
            className={styles.cart}
            to="/cart"
            aria-label={`Cart, ${itemCount} ${itemLabel}`}
          >
            {itemCount > 0 ? (
              <img className={styles.bagFilled} src={filledBag} alt="" />
            ) : (
              <svg
                className={styles.bag}
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M5.5 8.5h13l-.75 12h-11.5l-.75-12Z"
                  stroke="currentColor"
                />
                <path d="M9 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" />
              </svg>
            )}
            <span aria-hidden="true">{itemCount}</span>
          </Link>
        </nav>
      </PageContainer>
    </header>
  );
}
