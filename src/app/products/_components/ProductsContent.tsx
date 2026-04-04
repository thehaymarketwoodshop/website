'use client';

import { useMemo, useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { GalleryFilters, ProductGrid } from '@/components';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
  Product,
} from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';
import {
  ShopifyProduct,
  getProductPrice,
  getProductImages,
  getWoodTypeFromTags,
  getSizeFromTags,
} from '@/lib/shopifyClient';

type FilterOption = { id: string; name: string };

interface ProductsContentProps {
  initialProducts: ShopifyProduct[];
  itemTypes: FilterOption[];
  woodTypes: FilterOption[];
}

function shopifyToProduct(p: ShopifyProduct): Product {
  const price = getProductPrice(p);
  const images = getProductImages(p);
  const woodType = getWoodTypeFromTags(p.tags);
  const size = getSizeFromTags(p.tags);

  // Pass variants through so AddToCartButton can use them
  const variants = p.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.availableForSale ? e.node.id : e.node.id,
    availableForSale: e.node.availableForSale,
    priceV2: e.node.priceV2,
  }));

  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    category: p.productType || 'Products',
    itemType: p.productType as any,
    size: size as any,
    woodType: woodType as any,
    dimensions: '',
    description: p.description,
    images,
    soldOut: !p.availableForSale,
    featured: false,
    createdAt: '',
    price: price ?? undefined,
    variants,
  } as any;
}

function ProductsInner({ initialProducts, itemTypes, woodTypes }: ProductsContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters(parsed);
    setIsInitialized(true);
  }, [searchParams]);

  const allProducts: Product[] = useMemo(
    () => initialProducts.map(shopifyToProduct),
    [initialProducts],
  );

  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const query = serializeFiltersToParams(newFilters);
      router.push(`/products${query}`, { scroll: false });
    },
    [router],
  );

  const filteredProducts = useMemo(() => {
    const selectedItemTypes = (filters.itemTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase(),
    );
    const selectedWoodTypes = (filters.woodTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase(),
    );

    return allProducts.filter((product) => {
      if (filters.inStock && product.soldOut) return false;

      if (selectedItemTypes.length > 0) {
        const item = String((product as any).itemType ?? '').toLowerCase();
        if (!selectedItemTypes.includes(item)) return false;
      }

      if (filters.size) {
        const size = String((product as any).size ?? '').toLowerCase();
        if (size !== filters.size.toLowerCase()) return false;
      }

      if (selectedWoodTypes.length > 0) {
        const wood = String((product as any).woodType ?? '').toLowerCase();
        if (!selectedWoodTypes.includes(wood)) return false;
      }

      return true;
    });
  }, [filters, allProducts]);

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
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="heading-display">Products</h1>
            <p className="mt-4 body-large max-w-2xl">
              Browse our collection of handcrafted wooden goods. Each piece is unique and built
              to last.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="pb-24 sm:pb-32">
        <div className="container-wide">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <GalleryFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              woodTypes={woodTypes}
              itemTypes={itemTypes}
            />

            <div className="flex-1 min-w-0">
              <div className="mb-6 flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  {`${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
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

export function ProductsContent(props: ProductsContentProps) {
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
      <ProductsInner {...props} />
    </Suspense>
  );
}
