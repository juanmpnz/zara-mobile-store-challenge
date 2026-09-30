import { Link } from '@tanstack/react-router';
import { Button } from '@/components/ui/Button/Button';
import { formatPrice } from '@/features/products/presentation/formatPrice';

import styles from './CartSummary.module.scss';

interface CartSummaryProps {
  total?: number;
}

export function CartSummary({ total }: CartSummaryProps) {
  const hasItems = total !== undefined;
  const summaryClassName = [styles.summary, !hasItems && styles.empty]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className={summaryClassName}>
      <Link className={styles.continue} to="/">
        CONTINUE SHOPPING
      </Link>
      {hasItems ? (
        <>
          <div
            className={styles.total}
            aria-label={`Total ${formatPrice(total)}`}
          >
            <span>TOTAL</span>
            <span>{formatPrice(total)}</span>
          </div>
          <Button
            className={styles.pay}
            size="small"
            aria-disabled="true"
            aria-describedby="cart-payment-unavailable"
            onClick={(event) => event.preventDefault()}
          >
            PAY
          </Button>
          <span id="cart-payment-unavailable" className={styles.srOnly}>
            Payment is not available in this challenge.
          </span>
        </>
      ) : null}
    </footer>
  );
}
