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

// 🔧 Update this if your bucket name differs
const BUCKET = 'products';
const PRODUCTS_TABLE = 'products';

// DB row shape (kept flexible so you don't fight schema changes)
type DbProduct = {
  id: string;
  name: string;
  price?: number | null;
  sold_out?: boolean | null;
  size?: string | null;
  item_type?: string | null; // FK id
  wood_type?: string | null; // FK id
  image_path?: string | null; // storage path
  created_at?: string | null;

  // optional fields (if you add them later)
  slug?: string | null;
  category?: string | null;
  description?: string | null;
  dimensions?: string | null;
  finish?: string | null;
  care?: string | null;
  materials?: string | null;
  featured?: boolean | null;
};

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  const [woodTypes, setWoodTypes] = useState<FilterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<FilterOption[]>([]);

  const [dbProducts, setDbProducts] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);

  // 1) Initialize filters from URL params
  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters(parsed);
    setIsInitialized(true);
  }, [searchParams]);

  // 2) Load filter option lists
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
      setLoading(true);

      // Use select('*') so you don't break when you add new columns later
      const { data, error } = await supabase.from(PRODUCTS_TABLE).select('*');

      if (error) {
        console.error('Error loading products:', error);
        setDbProducts([]);
        setLoading(false);
        return;
      }

      setDbProducts((data ?? []) as DbProduct[]);
      setLoading(false);
    };

    loadProducts();
  }, []);

  // 4) Update URL when filters change
  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const query = serializeFiltersToParams(newFilters);
      router.push(`/products${query}`, { scroll: false });
    },
    [router]
  );

  // Helpers: lookup FK id -> name
  const woodNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const w of woodTypes) map.set(w.id, w.name);
    return map;
  }, [woodTypes]);

  const itemNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const i of itemTypes) map.set(i.id, i.name);
    return map;
  }, [itemTypes]);

  // 5) Map DB -> Product (shape required by ProductGrid)
  const allProducts: Product[] = useMemo(() => {
    return dbProducts.map((p) => {
      const woodName = p.wood_type ? woodNameById.get(p.wood_type) ?? '' : '';
      const itemName = p.item_type ? itemNameById.get(p.item_type) ?? '' : '';

      const imageUrl =
        p.image_path
          ? supabase.storage.from(BUCKET).getPublicUrl(p.image_path).data.publicUrl
          : '';

      // ProductGrid expects your full Product type, so we provide safe defaults.
      return ({
        id: p.id,
        name: p.name,

        // Required Product fields (safe defaults until you add them to DB/admin)
        slug: p.slug ?? p.id,
        category: p.category ?? 'Products',
        description: p.description ?? '',
        dimensions: p.dimensions ?? '',
        finish: p.finish ?? '',
        care: p.care ?? '',
        materials: p.materials ?? '',
        featured: Boolean(p.featured ?? false),
        createdAt: p.created_at ?? new Date().toISOString(),

        // Existing fields
        price: p.price ?? undefined,
        soldOut: Boolean(p.sold_out),
        size: (p.size ?? '') as any,

        // These are used for filtering/display. We store NAMES here (not IDs).
        // This keeps filters human-friendly and matches your filter UI.
        woodType: (woodName || '') as any,
        itemType: (itemName || '') as any,

        // Image
        image: imageUrl,
        imageUrl: imageUrl,
        images: imageUrl ? [imageUrl] : [],
      } as unknown) as Product;
    });
  }, [dbProducts, woodNameById, itemNameById]);

  // 6) Filter products (robust + case-insensitive)
  const filteredProducts = useMemo(() => {
    // Cast filter arrays to strings to avoid TS union friction
    const selectedItemTypes = (filters.itemTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );
    const selectedWoodTypes = (filters.woodTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );

    return allProducts.filter((product) => {
      // In-stock
      if (filters.inStock && product.soldOut) return false;

      // Item type (only if user selected)
      if (selectedItemTypes.length > 0) {
        const item = String((product as any).itemType ?? '').toLowerCase();
        if (!selectedItemTypes.includes(item)) return false;
      }

      // Size
      if (filters.size && product.size !== filters.size) return false;

      // Wood type (only if user selected)
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
                  {loading
                    ? 'Loading…'
                    : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'item' : 'items'}`}
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
