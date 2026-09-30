import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { getProductById, getProducts, normalizeProductsParams, type GetProductsParams } from '@/features/products/api/productsApi';
import { ApiError } from '@/lib/api/ApiError';

const PRODUCT_STALE_TIME = 5 * 60 * 1000;
const PRODUCT_DETAIL_MAX_RETRIES = 1;

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: GetProductsParams = {}) => [...productKeys.lists(), normalizeProductsParams(params)] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (productId: string) => [...productKeys.details(), productId] as const,
};

export function productsQueryOptions(params: GetProductsParams = {}) {
  const normalized = normalizeProductsParams(params);

  return queryOptions({
    queryKey: productKeys.list(normalized),
    queryFn: ({ signal }) => getProducts(normalized, { signal }),
    placeholderData: keepPreviousData,
    staleTime: PRODUCT_STALE_TIME,
  });
}

export function productQueryOptions(productId: string) {
  return queryOptions({
    queryKey: productKeys.detail(productId),
    queryFn: ({ signal }) => getProductById(productId, { signal }),
    retry: (failureCount, error) => !(error instanceof ApiError && error.status === 404) && failureCount < PRODUCT_DETAIL_MAX_RETRIES,
    retryDelay: 250,
    staleTime: PRODUCT_STALE_TIME,
  });
}

export function useProductsQuery(params: GetProductsParams = {}) {
  return useQuery(productsQueryOptions(params));
}

export function useProductQuery(productId: string) {
  return useQuery(productQueryOptions(productId));
}
