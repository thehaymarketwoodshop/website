'use client';

import { useMemo, useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabaseClient';
import { GalleryFilters, ProductGrid } from '@/components';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
  Product,
} from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';

type FilterOption = { id: string; name: string };

/** ✅ CHANGE THESE IF YOUR NAMES DIFFER */
const PRODUCTS_TABLE = 'products';
const BUCKET = 'products'; // e.g. 'product-images' or whatever your Storage bucket is called

// Shape coming from Supabase table (adjust field names if yours differ)
type DbProduct = {
  id: string;
  name: string;
  price?: number | null;
  sold_out?: boolean | null;
  size?: string | null;
  item_type?: string | null;   // could be id or name depending on your schema
  wood_type?: string | null;   // could be id or name depending on your schema
  image_path?: string | null;  // storage path like: "products/abc.jpg"
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  const [woodTypes, setWoodTypes] = useState<FilterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<FilterOption[]>([]);

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

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

      if (woodErr) console.error('Error loading wood types:', woodErr);
      else setWoodTypes((woods ?? []) as FilterOption[]);

      const { data: items, error: itemErr } = await supabase
        .from('item_types')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (itemErr) console.error('Error loading item types:', itemErr);
      else setItemTypes((items ?? []) as FilterOption[]);
    };

    loadOptions();
  }, []);

  // ✅ 3) Load products from Supabase (NOT placeholders)
  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);

      // Pull everything you need from your products table
      const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .select(
          'id, name, price, sold_out, size, item_type, wood_type, image_path, is_active, sort_order, created_at'
        )
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        setAllProducts([]);
        setLoadingProducts(false);
        return;
      }

      const rows = (data ?? []) as DbProduct[];

      // If you use is_active, hide inactive; if you don't, this will keep everything.
      const activeRows = rows.filter((p) => p.is_active !== false);

      // Convert image_path -> usable URL + map into your frontend Product type
      const mapped: Product[] = activeRows.map((p) => {
        const imagePath = p.image_path ?? '';

        // If your bucket is PUBLIC, this works.
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(imagePath);
        const imageUrl = publicUrlData?.publicUrl ?? '';

        return {
          id: p.id,
          name: p.name,
          price: p.price ?? undefined,

          // ⚠️ Match these to whatever your Product type expects
          soldOut: Boolean(p.sold_out),
          size: (p.size ?? '') as any,
          itemType: (p.item_type ?? '') as any,
          woodType: (p.wood_type ?? '') as any,

          // Common field names are `image` or `imageUrl` depending on your Product type.
          // If your Product type expects `image`, keep `image`.
          image: imageUrl,
        } as unknown as Product;
      });

      setAllProducts(mapped);
      setLoadingProducts(false);
    };

    loadProducts();
  }, []);

  // 4) Update URL when filters change
  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const queryString = serializeFiltersToParams(newFilters);
      router.push(`/products${queryString}`, { scroll: false });
    },
    [router]
  );

  // 5) Filter products (now from Supabase `allProducts`)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: Product) => {
      // In Stock filter
      if (filters.inStock && product.soldOut) return false;

      // Item Type filter
      if (filters.itemTypes.length > 0 && !filters.itemTypes.includes(product.itemType)) {
        return false;
      }

      // Size filter
      if (filters.size && product.size !== filters.size) return false;

      // Wood Type filter (case-insensitive OR within selection)
      if (filters.woodTypes.length > 0) {
        const productWood = String(product.woodType ?? '').toLowerCase();
        const matchesWood = filters.woodTypes.some(
          (wood) => String(wood).toLowerCase() === productWood
        );
        if (!matchesWood) return false;
      }

      return true;
    });
  }, [filters, allProducts]);

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
                  {loadingProducts ? 'Loading…' : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
                </p>
              </div>

              <ProductGrid products={filteredProducts} />

              {!loadingProducts && filteredProducts.length === 0 && (
                <p className="mt-10 text-sm text-neutral-500">
                  No products match these filters.
                </p>
              )}
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
