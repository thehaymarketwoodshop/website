'use client';

import { useMemo, useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabaseClient';
import { GalleryFilters, ProductGrid } from '@/components';
import { products } from '@/data/products';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
  Product,
} from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';

type FilterOption = { id: string; name: string };

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  const [woodTypes, setWoodTypes] = useState<FilterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<FilterOption[]>([]);

  // 1) Initialize filters from URL params
  useEffect(() => {
    const parsedFilters = parseFiltersFromParams(searchParams);
    setFilters(parsedFilters);
    setIsInitialized(true);
  }, [searchParams]);

  // 2) Load active filter options from Supabase
  useEffect(() => {
    const loadOptions = async () => {
      const { data: woods, error: woodErr } = await supabase
        .from('wood_types')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (woodErr) {
        console.error('Error loading wood types:', woodErr);
      } else {
        setWoodTypes((woods ?? []) as FilterOption[]);
      }

      const { data: items, error: itemErr } = await supabase
        .from('item_types')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (itemErr) {
        console.error('Error loading item types:', itemErr);
      } else {
        setItemTypes((items ?? []) as FilterOption[]);
      }
    };

    loadOptions();
  }, []);

  // 3) Update URL when filters change
  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const queryString = serializeFiltersToParams(newFilters);
      router.push(`/products${queryString}`, { scroll: false });
    },
    [router]
  );

  // 4) Filter products (currently from static `products`)
  const filteredProducts = useMemo(() => {
    return products.filter((product: Product) => {
      // In Stock filter
      if (filters.inStock && product.soldOut) return false;

      // Item Type filter (OR within selection)
      if (filters.itemTypes.length > 0 && !filters.itemTypes.includes(product.itemType)) {
        return false;
      }

      // Size filter
      if (filters.size && product.size !== filters.size) return false;

      // Wood Type filter (case-insensitive OR within selection)
      if (filters.woodTypes.length > 0) {
        const productWood = product.woodType.toLowerCase();
        const matchesWood = filters.woodTypes.some(
          (wood) => wood.toLowerCase() === productWood
        );
        if (!matchesWood) return false;
      }

      return true;
    });
  }, [filters]);

  // Loading skeleton until URL filters initialize
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
            <h1 className="heading-display">Products</h1>
            <p className="mt-4 body-large max-w-2xl">
              Browse our collection of handcrafted wooden goods. Each piece is unique and built to last.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Products Content */}
      <section className="pb-24 sm:pb-32">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Filters */}
            <GalleryFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              woodTypes={woodTypes}
              itemTypes={itemTypes}
            />

            {/* Product Grid */}
            <div className="flex-1 min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
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

export default function ProductsPage() {
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
      <ProductsContent />
    </Suspense>
  );
}
