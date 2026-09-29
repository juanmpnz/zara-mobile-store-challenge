import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button/Button';
import { SearchInput } from '@/components/ui/SearchInput/SearchInput';
import { ProductGrid } from '@/features/products/components/ProductGrid/ProductGrid';
import { useProductsQuery } from '@/features/products/queries/productQueries';

import styles from './ProductCatalog.module.scss';

const SEARCH_DEBOUNCE_MS = 300;

export function ProductCatalog() {
  const [searchValue, setSearchValue] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const normalizedSearch = searchValue.trim();

    if (!normalizedSearch) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setSearch(normalizedSearch);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeout);
  }, [searchValue]);

  const productsQuery = useProductsQuery(search ? { search } : {});
  const products = productsQuery.data ?? [];
  const isUpdating =
    productsQuery.isFetching && productsQuery.isPlaceholderData;

  const handleSearchValueChange = (value: string): void => {
    setSearchValue(value);

    if (!value.trim()) {
      setSearch('');
    }
  };

  return (
    <section className={styles.catalog} aria-labelledby="catalog-heading">
      <h1 id="catalog-heading" className={styles.title}>
        Products
      </h1>

      <div className={styles.searchArea}>
        <SearchInput
          label="Search products"
          value={searchValue}
          onValueChange={handleSearchValueChange}
        />

        {productsQuery.isSuccess && !isUpdating ? (
          <p
            className={styles.resultCount}
            aria-live="polite"
            aria-atomic="true"
          >
            {products.length} RESULTS
          </p>
        ) : null}
      </div>

      <div
        className={styles.results}
        aria-busy={productsQuery.isPending || productsQuery.isFetching}
      >
        {productsQuery.isPending ? (
          <p className={styles.state} role="status">
            Loading products…
          </p>
        ) : null}

        {isUpdating ? (
          <p
            className={styles.resultCount}
            role="status"
            aria-label="Updating products…"
          >
            Updating products…
          </p>
        ) : null}

        {productsQuery.isError ? (
          <div className={styles.state} role="alert">
            <p>Unable to load products.</p>
            <Button
              variant="secondary"
              size="small"
              onClick={() => void productsQuery.refetch()}
            >
              Retry
            </Button>
          </div>
        ) : null}

        {productsQuery.isSuccess && products.length === 0 ? (
          <p className={styles.state}>No products found.</p>
        ) : null}

        {productsQuery.isSuccess && products.length > 0 ? (
          <ProductGrid products={products} label="Product results" />
        ) : null}
      </div>
    </section>
  );
}
