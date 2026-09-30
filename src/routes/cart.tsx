import { createFileRoute } from '@tanstack/react-router';
import { CartPage } from '@/features/cart/components/CartPage/CartPage';

export const Route = createFileRoute('/cart')({
  component: function CartRoute() {
    return <CartPage />;
  },
});
