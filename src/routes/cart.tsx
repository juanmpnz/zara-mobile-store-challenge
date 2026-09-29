import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/cart')({
  component: function CartPage() {
    return <h1>Cart</h1>;
  },
});
