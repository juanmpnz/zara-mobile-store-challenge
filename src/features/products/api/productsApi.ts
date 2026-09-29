import { apiRequest } from '../../../lib/api/httpClient';
import type { ProductDetail, ProductSummary } from '../model/product';
import { parseProductDetailDto, parseProductSummaryDtos } from './productDtos';
import { mapProductDetail, mapProductSummary } from './productMapper';

export const DEFAULT_PRODUCT_LIMIT = 20;

export interface GetProductsParams {
  search?: string;
  limit?: number;
  offset?: number;
}

export interface NormalizedProductsParams {
  search?: string;
  limit: number;
  offset?: number;
}

export interface ProductRequestOptions {
  signal?: AbortSignal;
}

export function normalizeProductsParams(
  params: GetProductsParams = {},
): NormalizedProductsParams {
  return {
    search: params.search,
    limit: params.limit ?? DEFAULT_PRODUCT_LIMIT,
    offset: params.offset,
  };
}

export async function getProducts(
  params: GetProductsParams = {},
  options: ProductRequestOptions = {},
): Promise<ProductSummary[]> {
  const normalized = normalizeProductsParams(params);
  const response = await apiRequest('/products', {
    query: {
      search: normalized.search,
      limit: normalized.limit,
      offset: normalized.offset,
    },
    signal: options.signal,
  });

  return parseProductSummaryDtos(response).map(mapProductSummary);
}

export async function getProductById(
  productId: string,
  options: ProductRequestOptions = {},
): Promise<ProductDetail> {
  const response = await apiRequest(
    `/products/${encodeURIComponent(productId)}`,
    { signal: options.signal },
  );

  return mapProductDetail(parseProductDetailDto(response));
}
