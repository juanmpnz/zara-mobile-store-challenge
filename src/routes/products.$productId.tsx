import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/products/$productId')({
  component: function ProductDetailPage() {
    const { productId } = Route.useParams();

    return (
      <>
        <h1>Product detail</h1>
        <p>Product ID: {productId}</p>
      </>
    );
  },
});
