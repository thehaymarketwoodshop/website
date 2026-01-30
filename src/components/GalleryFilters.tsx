'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, X, Check, RotateCcw } from 'lucide-react';
import {
  GalleryFilters as GalleryFiltersType,
  DEFAULT_FILTERS,
  ItemType,
  Size,
  ITEM_TYPE_LABELS,
  SIZE_LABELS,
  WOOD_TYPES,
} from '@/types/product';
import { countActiveFilters, areFiltersDefault } from '@/lib/filter-utils';
import { cn } from '@/lib/utils';

interface GalleryFiltersProps {
  filters: GalleryFiltersType;
  onFiltersChange: (filters: GalleryFiltersType) => void;
}

export function GalleryFilters({ filters, onFiltersChange }: GalleryFiltersProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeCount = countActiveFilters(filters);
  const isDefault = areFiltersDefault(filters);

  const handleInStockToggle = useCallback(() => {
    onFiltersChange({ ...filters, inStock: !filters.inStock });
  }, [filters, onFiltersChange]);

  const handleItemTypeToggle = useCallback(
    (type: ItemType) => {
      const newTypes = filters.itemTypes.includes(type)
        ? filters.itemTypes.filter((t) => t !== type)
        : [...filters.itemTypes, type];
      onFiltersChange({ ...filters, itemTypes: newTypes });
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
      {/* In Stock Toggle - Always at top */}
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
              filters.inStock
                ? 'bg-white border-white'
                : 'border-neutral-300'
            )}
          >
            {filters.inStock && <Check size={14} className="text-neutral-900" />}
          </div>
          <span className="font-medium">In Stock Only</span>
        </button>
      </div>

      {/* Item Type Multi-select Pills */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Item Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(ITEM_TYPE_LABELS) as ItemType[]).map((type) => (
            <button
              key={type}
              onClick={() => handleItemTypeToggle(type)}
              className={cn(
                'filter-pill',
                filters.itemTypes.includes(type)
                  ? 'filter-pill-active'
                  : 'filter-pill-inactive'
              )}
            >
              {ITEM_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Size Single-select Segmented Control */}
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

      {/* Wood Type Multi-select Pills */}
      <div>
        <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
          Wood Type
        </h3>
        <div className="flex flex-wrap gap-2">
          {WOOD_TYPES.map((wood) => (
            <button
              key={wood}
              onClick={() => handleWoodTypeToggle(wood)}
              className={cn(
                'filter-pill',
                filters.woodTypes.includes(wood)
                  ? 'filter-pill-active'
                  : 'filter-pill-inactive'
              )}
            >
              {wood}
            </button>
          ))}
        </div>
      </div>

      {/* Clear All Button */}
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

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 lg:hidden"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden"
            >
              {/* Header */}
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

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)] scrollbar-thin">
                <FilterContent />
              </div>

              {/* Footer */}
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
