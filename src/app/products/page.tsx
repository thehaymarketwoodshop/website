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

// ✅ Your actual bucket (based on the URL you pasted)
const STORAGE_BUCKET = 'product-images';
const PRODUCTS_TABLE = 'products';

function isHttpUrl(v: string) {
  return v.startsWith('http://') || v.startsWith('https://');
}

// DB row shape aligned to your ADMIN schema
type DbProduct = {
  id: string;
  name: string;

  // admin schema
  price_cents?: number | null;
  is_in_stock?: boolean | null;
  buy_url?: string | null;

  // relations (admin)
  wood_type_id?: string | null;
  item_type_id?: string | null;

  // images (admin)
  image_url?: string | null;   // can be full URL OR storage path
  image_path?: string | null;  // legacy fallback

  // display fields (optional)
  description?: string | null;
  dimensions?: string | null;
  size_label?: string | null;

  created_at?: string | null;

  // optional fields used by your Product type
  slug?: string | null;
  category?: string | null;
  finish?: string | null;
  care?: string | null;
  materials?: string | null;
  featured?: boolean | null;
};

function resolveImageUrl(p: DbProduct): string {
  const raw = p.image_url || p.image_path || '';
  if (!raw) return '';

  // If admin stored a full public URL, use it directly
  if (isHttpUrl(raw)) return raw;

  // Otherwise treat it as a storage path
  // Example stored path might be: "products/uuid.jpg"
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(raw).data.publicUrl;
}

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
      const woodName = p.wood_type_id ? woodNameById.get(p.wood_type_id) ?? '' : '';
      const itemName = p.item_type_id ? itemNameById.get(p.item_type_id) ?? '' : '';
      
      const imageUrl = resolveImageUrl(p);

      const price =
        typeof p.price_cents === 'number' ? p.price_cents / 100 : undefined;

      const soldOut = !(p.is_in_stock ?? true);

      // If your filter UI uses "size", we’ll map it from dimensions/size_label
      const size = (p.dimensions ?? p.size_label ?? '') as any;
return ({
  id: p.id,
  name: p.name,

  slug: p.slug ?? p.id,
  category: p.category ?? 'Products',
  description: p.description ?? '',
  dimensions: p.dimensions ?? '',
  finish: p.finish ?? '',
  care: p.care ?? '',
  materials: p.materials ?? '',
  featured: Boolean(p.featured ?? false),
  createdAt: p.created_at ?? new Date().toISOString(),

  // Pricing / stock
  price,
  soldOut,
  size,

  // Filter/display names
  woodType: (woodName || '') as any,
  itemType: (itemName || '') as any,

  // ✅ THIS IS THE IMPORTANT LINE
  etsyUrl: p.buy_url ?? '',

  // Images
  image: imageUrl,
  imageUrl: imageUrl,
  images: imageUrl ? [imageUrl] : [],
} as unknown) as Product;

    });
  }, [dbProducts, woodNameById, itemNameById]);

  // 6) Filter products
  const filteredProducts = useMemo(() => {
    const selectedItemTypes = (filters.itemTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );
    const selectedWoodTypes = (filters.woodTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );

    return allProducts.filter((product) => {
      // In-stock
      if (filters.inStock && product.soldOut) return false;

      // Item type
      if (selectedItemTypes.length > 0) {
        const item = String((product as any).itemType ?? '').toLowerCase();
        if (!selectedItemTypes.includes(item)) return false;
      }

      // Size
      if (filters.size && product.size !== filters.size) return false;

      // Wood type
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
