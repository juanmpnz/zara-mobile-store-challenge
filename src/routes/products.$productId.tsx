import { createFileRoute } from '@tanstack/react-router';
import { ProductDetailPage } from '@/features/products/pages/ProductDetailPage/ProductDetailPage';

export const Route = createFileRoute('/products/$productId')({
  component: function ProductDetailRoute() {
    const { productId } = Route.useParams();
    return <ProductDetailPage productId={productId} />;
  },
});
