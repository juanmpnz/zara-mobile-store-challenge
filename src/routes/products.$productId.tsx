import { createFileRoute } from '@tanstack/react-router';
import { ProductDetail } from '@/features/products/components/ProductDetail/ProductDetail';

export const Route = createFileRoute('/products/$productId')({
  component: function ProductDetailRoute() {
    const { productId } = Route.useParams();
    return <ProductDetail productId={productId} />;
  },
});
