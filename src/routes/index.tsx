import { createFileRoute } from '@tanstack/react-router';
import { ProductCatalog } from '@/features/products/components/ProductCatalog/ProductCatalog';

export const Route = createFileRoute('/')({
  component: ProductCatalog,
});
