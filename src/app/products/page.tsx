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
  ItemType,
  WoodType,
} from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';

type FilterOption = { id: string; name: string };

type DbProduct = {
  id: string;
  name: string;
  price?: number | null;
  sold_out?: boolean | null;
  size?: string | null;
  item_type?: string | null; // FK id
  wood_type?: string | null; // FK id
  image_path?: string | null; // Storage path
  is_active?: boolean | null;
  sort_order?: number | null;
  created_at?: string | null;
};

const PRODUCTS_TABLE = 'products';
const BUCKET = 'products'; // <-- change to your real bucket name if different

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  const [woodTypes, setWoodTypes] = useState<FilterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<FilterOption[]>([]);
  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);

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
      setWoodTypes((woods ?? []) as FilterOption[]);

      const { data: items, error: itemErr } = await supabase
        .from('item_types')
        .select('id, name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (itemErr) console.error('Error loading item types:', itemErr);
      setItemTypes((items ?? []) as FilterOption[]);
    };

    loadOptions();
  }, []);

  // 3) Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .select('id, name, price, sold_out, size, item_type, wood_type, image_path, is_active, sort_order, created_at')
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading products:', error);
        setDbProducts([]);
        return;
      }

      setDbProducts((data ?? []) as DbProduct[]);
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

  // 5) Convert DB rows -> Product[] (what ProductGrid expects)
  const allProducts: Product[] = useMemo(() => {
    // Hide inactive if you use is_active; if not, this keeps everything.
    const active = dbProducts.filter((p) => p.is_active !== false);

    return active.map((p) => {
      const woodName =
        woodTypes.find((w) => w.id === p.wood_type)?.name ?? '';

      const itemName =
        itemTypes.find((i) => i.id === p.item_type)?.name ?? '';

      const imageUrl =
        p.image_path
          ? supabase.storage.from(BUCKET).getPublicUrl(p.image_path).data.publicUrl
          : '';

      // Cast names into your union types so your “old” filter logic compiles.
      // IMPORTANT: The names in Supabase should match your ItemType/WoodType values.
      const woodType = woodName as unknown as WoodType;
      const itemType = itemName as unknown as ItemType;

      return {
  id: p.id,
  name: p.name,

  // 🔒 Required Product fields (safe defaults)
  slug: (p as any).slug ?? p.id,
  category: (p as any).category ?? 'Products',
  description: (p as any).description ?? '',
  dimensions: (p as any).dimensions ?? '',

  // If your Product type has these, defaults keep build passing
  finish: (p as any).finish ?? '',
  care: (p as any).care ?? '',
  materials: (p as any).materials ?? '',
  featured: Boolean((p as any).featured ?? false),
  createdAt: (p as any).createdAt ?? p.created_at ?? new Date().toISOString(),

  price: p.price ?? undefined,
  soldOut: Boolean(p.sold_out),
  size: (p.size ?? '') as any,

  woodType: woodType,
  itemType: itemType,

  // Must match ProductGrid expectation
  image: imageUrl,
} as unknown as Product;

    });
  }, [dbProducts, woodTypes, itemTypes]);

  // 6) Filter products (same logic as before)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product: Product) => {
      if (filters.inStock && product.soldOut) return false;

      if (filters.itemTypes.length > 0 && !filters.itemTypes.includes(product.itemType)) {
        return false;
      }

      if (filters.size && product.size !== filters.size) return false;

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

            {/* Product Grid (back to normal) */}
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
