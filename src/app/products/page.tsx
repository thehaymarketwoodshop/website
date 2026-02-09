'use client';

import { useMemo, useCallback, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';

import { supabase } from '@/lib/supabaseClient';
import { GalleryFilters } from '@/components';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
} from '@/types/product';
import { parseFiltersFromParams, serializeFiltersToParams } from '@/lib/filter-utils';

type FilterOption = { id: string; name: string };

type DbProduct = {
  id: string;
  name: string;
  sold_out: boolean | null;
  size: string | null;
  item_type: string | null;
  wood_type: string | null;
  image_path: string | null;
  is_active: boolean | null;
};

const PRODUCTS_TABLE = 'products';
const BUCKET = 'products'; // <-- change this if your Storage bucket name is different
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<GalleryFiltersType>(DEFAULT_FILTERS);
  const [isInitialized, setIsInitialized] = useState(false);

  const [woodTypes, setWoodTypes] = useState<FilterOption[]>([]);
  const [itemTypes, setItemTypes] = useState<FilterOption[]>([]);
  const [products, setProducts] = useState<DbProduct[]>([]);

  /* -------------------------------
     1) Init filters from URL
  -------------------------------- */
  useEffect(() => {
    const parsed = parseFiltersFromParams(searchParams);
    setFilters(parsed);
    setIsInitialized(true);
  }, [searchParams]);

  /* -------------------------------
     2) Load filter options
  -------------------------------- */
  useEffect(() => {
    const loadOptions = async () => {
      const { data: woods } = await supabase
        .from('wood_types')
        .select('id, name')
        .eq('is_active', true);

      const { data: items } = await supabase
        .from('item_types')
        .select('id, name')
        .eq('is_active', true);

      setWoodTypes(woods ?? []);
      setItemTypes(items ?? []);
    };

    loadOptions();
  }, []);

  /* -------------------------------
     3) Load products from Supabase
  -------------------------------- */
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from(PRODUCTS_TABLE)
        .select('*');

      console.log('RAW PRODUCTS:', data);
      console.log('PRODUCT ERROR:', error);

      if (!error && data) {
        setProducts(data as DbProduct[]);
      }
    };

    loadProducts();
  }, []);

  /* -------------------------------
     4) Handle filter changes
  -------------------------------- */
  const handleFiltersChange = useCallback(
    (newFilters: GalleryFiltersType) => {
      setFilters(newFilters);
      const query = serializeFiltersToParams(newFilters);
      router.push(`/products${query}`, { scroll: false });
    },
    [router]
  );

  /* -------------------------------
     5) Apply filters (NO GRID)
  -------------------------------- */
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (filters.inStock && p.sold_out) return false;

      if (filters.size && p.size !== filters.size) return false;

      if (filters.itemTypes.length > 0) {
        const itemName =
          itemTypes.find((i) => i.id === p.item_type)?.name ?? '';
        if (!filters.itemTypes.includes(itemName)) return false;
      }

      if (filters.woodTypes.length > 0) {
        const woodName =
          woodTypes.find((w) => w.id === p.wood_type)?.name ?? '';
        if (!filters.woodTypes.includes(woodName)) return false;
      }

      return true;
    });
  }, [products, filters, woodTypes, itemTypes]);

  if (!isInitialized) {
    return <div className="pt-40 text-center">Loading…</div>;
  }

  return (
    <>
      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-12 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="container-wide">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="heading-display">Products</h1>
            <p className="mt-4 body-large max-w-2xl">
              Browse our handcrafted pieces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-24">
        <div className="container-wide flex flex-col lg:flex-row gap-10">
          <GalleryFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            woodTypes={woodTypes}
            itemTypes={itemTypes}
          />

          <div className="flex-1">
            <p className="text-sm text-neutral-500 mb-4">
              {filteredProducts.length} items
            </p>

            {/* ✅ DEBUG LIST — GUARANTEED TO RENDER */}
            {/* ✅ Clean Grid */}
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredProducts.map((p) => {
    const woodName = woodTypes.find((w) => w.id === p.wood_type)?.name ?? '—';
    const itemName = itemTypes.find((i) => i.id === p.item_type)?.name ?? '—';

    const imageUrl =
      p.image_path
        ? supabase.storage.from(BUCKET).getPublicUrl(p.image_path).data.publicUrl
        : '';

    return (
      <div
        key={p.id}
        className="group overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition hover:shadow-md"
      >
        {/* Image */}
        <div className="aspect-[4/3] w-full bg-neutral-100 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={p.name}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs text-neutral-500">
              No image
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="text-base font-semibold text-neutral-900">{p.name}</h3>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              {itemName}
            </span>
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
              {woodName}
            </span>
            {p.size ? (
              <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700">
                {p.size}
              </span>
            ) : null}
            {p.sold_out ? (
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs text-red-700">
                Sold out
              </span>
            ) : (
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs text-emerald-700">
                In stock
              </span>
            )}
          </div>
        </div>
      </div>
    );
  })}
</div>

            
          </div>
        </div>
      </section>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="pt-40 text-center">Loading…</div>}>
      <ProductsContent />
    </Suspense>
  );
}
