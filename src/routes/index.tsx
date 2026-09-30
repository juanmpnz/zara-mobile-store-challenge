import { createFileRoute } from '@tanstack/react-router';
import { ProductCatalogPage } from '@/features/products/pages/ProductCatalogPage/ProductCatalogPage';

export const Route = createFileRoute('/')({
  component: ProductCatalogPage,
});
