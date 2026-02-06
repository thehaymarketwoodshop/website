'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
  ItemType,
  Size,
  SIZE_LABELS,
} from '@/types/product';
import { countActiveFilters, areFiltersDefault } from '@/lib/filter-utils';
import { cn } from '@/lib/utils';

type FilterOption = { id: string; name: string };

interface GalleryFiltersProps {
  filters: GalleryFiltersType;
  onFiltersChange: (filters: GalleryFiltersType) => void;

  // ✅ Dynamic options from Supabase
  woodTypes: FilterOption[];
  itemTypes: FilterOption[];
}

export function GalleryFilters({
  filters,
  onFiltersChange,
  woodTypes,
  itemTypes,
}: GalleryFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const isDefault = areFiltersDefault(filters);

  const handleInStockToggle = useCallback(() => {
    onFiltersChange({ ...filters, inStock: !filters.inStock });
  }, [filters, onFiltersChange]);

  // We store selected item types as string names in filters.itemTypes (existing behavior)
  const handleItemTypeToggle = useCallback(
    (typeName: string) => {
      const type = typeName as unknown as ItemType; // keep compatibility with existing type
      const newTypes = (filters.itemTypes as unknown as string[]).includes(typeName)
        ? (filters.itemTypes as unknown as string[]).filter((t) => t !== typeName)
        : [...(filters.itemTypes as unknown as string[]), typeName];

      onFiltersChange({ ...filters, itemTypes: newTypes as unknown as ItemType[] });
    },
    [filters, onFiltersChange]
  );

  const handleSizeChange = useCallback(
    (size: Size | null) => {
      onFiltersChange({ ...filters, size: filters.size === size ? null : size });
    },
    [filters, onFiltersChange]
  );

  const handleWoodTypeToggle = useCallback(
    (wood: string) => {
      const newWoods = filters.woodTypes.includes(wood)
        ? filters.woodTypes.filter((w) => w !== wood)
        : [...filters.woodTypes, wood];
      onFiltersChange({ ...filters, woodTypes: newWoods });
    },
    [filters, onFiltersChange]
  );

  const handleClearAll = useCallback(() => {
    onFiltersChange(DEFAULT_FILTERS);
  }, [onFiltersChange]);

  const FilterContent = () => (
    <div className="space-y-8">
      {/* Availability */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Availability
        </h3>
        <button
          onClick={handleInStockToggle}
          className={cn(
            'flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-all duration-200',
            filters.inStock
              ? 'bg-neutral-900 text-white border-neutral-900'
              : 'bg-white text-neutral-600 border-neutral-200 hover:border-neutral-300'
          )}
        >
          <div
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
              filters.inStock ? 'bg-white border-white' : 'border-neutral-300'
            )}
          >
            {filters.inStock && <Check size={14} className="text-neutral-900" />}
          </div>
          <span className="font-medium">In Stock Only</span>
        </button>
      </div>

      {/* Item Type */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Item Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {itemTypes.map((t) => {
            const selected = (filters.itemTypes as unknown as string[]).includes(t.name);
            return (
              <button
                key={t.id}
                onClick={() => handleItemTypeToggle(t.name)}
                className={cn('filter-pill', selected ? 'filter-pill-active' : 'filter-pill-inactive')}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Size */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Size
        </h3>
        <div className="inline-flex p-1 bg-neutral-100 rounded-full">
          {(Object.keys(SIZE_LABELS) as Size[]).map((size) => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-full transition-all duration-200',
                filters.size === size
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {SIZE_LABELS[size]}
            </button>
          ))}
        </div>
      </div>

      {/* Wood Type */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Wood Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {woodTypes.map((w) => (
            <button
              key={w.id}
              onClick={() => handleWoodTypeToggle(w.name)}
              className={cn(
                'filter-pill',
                filters.woodTypes.includes(w.name) ? 'filter-pill-active' : 'filter-pill-inactive'
              )}
            >
              {w.name}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      {!isDefault && (
        <button
          onClick={handleClearAll}
          className="flex items-center gap-2 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <RotateCcw size={14} />
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
            {activeCount > 0 && (
              <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                {activeCount}
              </span>
            )}
          </div>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-6">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-neutral-200 rounded-full text-neutral-900 font-medium hover:border-neutral-300 transition-colors"
        >
          <SlidersHorizontal size={18} />
          Filters
          {activeCount > 0 && (
            <span className="px-2 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
            >
              <div className="flex items-center justify-between p-6 border-b border-neutral-100">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-semibold text-neutral-900">Filters</h2>
                  {activeCount > 0 && (
                    <span className="px-2.5 py-0.5 bg-neutral-900 text-white text-xs font-medium rounded-full">
                      {activeCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-2 -mr-2 text-neutral-500 hover:text-neutral-900 transition-colors"
                  aria-label="Close filters"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] scrollbar-thin">
                <FilterContent />
              </div>

              <div className="p-6 border-t border-neutral-100 bg-white">
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Show Results
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
