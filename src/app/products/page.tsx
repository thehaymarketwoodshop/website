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

const STORAGE_BUCKET = 'product-images';
const PRODUCTS_TABLE = 'products';

function isHttpUrl(v: string) {
  return v.startsWith('http://') || v.startsWith('https://');
}

type DbProduct = {
  id: string;
  name: string;

  price_cents?: number | null;
  is_in_stock?: boolean | null;
  buy_url?: string | null;

  wood_type_id?: string | null;
  item_type_id?: string | null;

  image_url?: string | null;     // full URL OR storage path
  image_urls?: string[] | null;  // ✅ new: multiple
  image_path?: string | null;    // legacy fallback

  description?: string | null;
  dimensions?: string | null;
  size_label?: string | null;

  created_at?: string | null;

  slug?: string | null;
  category?: string | null;
  care?: string | null;
  featured?: boolean | null;
};

function resolveOneImageUrl(raw: string): string {
  if (!raw) return '';
  if (isHttpUrl(raw)) return raw;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(raw).data.publicUrl;
}

function resolveImageUrls(p: DbProduct): string[] {
  const urls: string[] = [];

  // Prefer multi-image column
  if (Array.isArray(p.image_urls)) {
    for (const raw of p.image_urls) {
      const resolved = resolveOneImageUrl(String(raw || ''));
      if (resolved) urls.push(resolved);
    }
  }

  // Fallback single url/path
  if (p.image_url) {
    const resolved = resolveOneImageUrl(p.image_url);
    if (resolved) urls.push(resolved);
  } else if (p.image_path) {
    const resolved = resolveOneImageUrl(p.image_path);
    if (resolved) urls.push(resolved);
  }

  // De-dupe
  return Array.from(new Set(urls));
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

  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters(parsed);
    setIsInitialized(true);
  }, [searchParams]);

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

  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const query = serializeFiltersToParams(newFilters);
      router.push(`/products${query}`, { scroll: false });
    },
    [router]
  );

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

  const allProducts: Product[] = useMemo(() => {
    return dbProducts.map((p) => {
      const woodName = p.wood_type_id ? woodNameById.get(p.wood_type_id) ?? '' : '';
      const itemName = p.item_type_id ? itemNameById.get(p.item_type_id) ?? '' : '';

      const images = resolveImageUrls(p);
      const imageUrl = images[0] || '';

      const price =
        typeof p.price_cents === 'number' ? p.price_cents / 100 : undefined;

      const soldOut = !(p.is_in_stock ?? true);
      const size = (p.dimensions ?? p.size_label ?? '') as any;

      return ({
        id: p.id,
        name: p.name,

        slug: p.slug ?? p.id,
        category: p.category ?? 'Products',
        description: p.description ?? '',
        dimensions: p.dimensions ?? '',
        care: p.care ?? '',
        featured: Boolean(p.featured ?? false),
        createdAt: p.created_at ?? new Date().toISOString(),

        price,
        soldOut,
        size,

        woodType: (woodName || '') as any,
        itemType: (itemName || '') as any,

        // ✅ Etsy link for ProductCard
        etsyUrl: p.buy_url ?? '',

        image: imageUrl,
        imageUrl: imageUrl,
        images,
      } as unknown) as Product;
    });
  }, [dbProducts, woodNameById, itemNameById]);

  const filteredProducts = useMemo(() => {
    const selectedItemTypes = (filters.itemTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );
    const selectedWoodTypes = (filters.woodTypes as unknown as string[]).map((s) =>
      String(s).toLowerCase()
    );

    return allProducts.filter((product) => {
      if (filters.inStock && product.soldOut) return false;

      if (selectedItemTypes.length > 0) {
        const item = String((product as any).itemType ?? '').toLowerCase();
        if (!selectedItemTypes.includes(item)) return false;
      }

      if (filters.size && product.size !== filters.size) return false;

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
              Browse our collection of handcrafted wooden goods. Each piece is unique and built to last.
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
