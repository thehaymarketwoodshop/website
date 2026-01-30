'use client';

import { useMemo, useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { GalleryFilters, ProductGrid } from '@/components';
import { products } from '@/data/products';
import { GalleryFilters as GalleryFiltersType, DEFAULT_FILTERS, Product } from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';

function GalleryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize filters from URL params on mount
  useEffect(() => {
    const parsedFilters = parseFiltersFromParams(searchParams);
    setFilters(parsedFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // Update URL when filters change (after initial load)
  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const queryString = serializeFiltersToParams(newFilters);
      router.push(`/gallery${queryString}`, { scroll: false });
    },
    [router]
  );

  // Filter products based on current filters (memoized for performance)
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      // In Stock filter
      if (filters.inStock && product.soldOut) {
        return false;
      }

      // Item Type filter (OR within selection)
      if (filters.itemTypes.length > 0 && !filters.itemTypes.includes(product.itemType)) {
        return false;
      }

      // Size filter
      if (filters.size && product.size !== filters.size) {
        return false;
      }

      // Wood Type filter (OR within selection, case-insensitive)
      if (filters.woodTypes.length > 0) {
        const productWood = product.woodType.toLowerCase();
        const matchesWood = filters.woodTypes.some(
          (wood) => wood.toLowerCase() === productWood
        );
        if (!matchesWood) {
          return false;
        }
      }

      return true;
    });
  }, [filters]);

  // Don't render until filters are initialized from URL
  if (!isInitialized) {
    return (
      <div className="min-h-screen pt-32 sm:pt-40">
        <div className="container-wide">
          <div className="animate-pulse">
            <div className="h-10 w-48 bg-neutral-200 rounded-lg mb-4" />
            <div className="h-6 w-96 bg-neutral-100 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="heading-display">Gallery</h1>
            <p className="mt-4 body-large max-w-2xl">
              Browse our collection of handcrafted wooden goods. Each piece is
              unique and built to last.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Gallery Content */}
      <section className="pb-24 sm:pb-32">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Filters */}
            <GalleryFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
            />

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              {/* Results count */}
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  {filteredProducts.length}{' '}
                  {filteredProducts.length === 1 ? 'item' : 'items'}
                </p>
              </div>

              <ProductGrid products={filteredProducts} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function GalleryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-32 sm:pt-40">
          <div className="container-wide">
            <div className="animate-pulse">
              <div className="h-10 w-48 bg-neutral-200 rounded-lg mb-4" />
              <div className="h-6 w-96 bg-neutral-100 rounded-lg" />
            </div>
          </div>
        </div>
      }
    >
      <GalleryContent />
    </Suspense>
  );
}
