import { GalleryFilters, DEFAULT_FILTERS, ItemType, Size } from '@/types/product';

export function parseFiltersFromParams(searchParams: URLSearchParams): GalleryFilters {
  const inStockParam = searchParams.get('inStock');
  const typeParam = searchParams.get('type');
  const sizeParam = searchParams.get('size');
  const woodParam = searchParams.get('wood');

  return {
    inStock: inStockParam === null ? DEFAULT_FILTERS.inStock : inStockParam === '1',
    itemTypes: typeParam
      ? (typeParam.split(',').filter((t) => ['small_goods', 'tables', 'cabinets'].includes(t)) as ItemType[])
      : [],
    size: sizeParam && ['small', 'medium', 'large'].includes(sizeParam) ? (sizeParam as Size) : null,
    woodTypes: woodParam ? woodParam.split(',').filter(Boolean) : [],
  };
}

export function serializeFiltersToParams(filters: GalleryFilters): string {
  const params = new URLSearchParams();

  // Only add inStock param if it differs from default (true)
  if (!filters.inStock) {
    params.set('inStock', '0');
  }

  if (filters.itemTypes.length > 0) {
    params.set('type', filters.itemTypes.join(','));
  }

  if (filters.size) {
    params.set('size', filters.size);
  }

  if (filters.woodTypes.length > 0) {
    params.set('wood', filters.woodTypes.join(','));
  }

  const paramString = params.toString();
  return paramString ? `?${paramString}` : '';
}

export function countActiveFilters(filters: GalleryFilters): number {
  let count = 0;
  
  // Count inStock as active only if it's OFF (showing sold out items)
  if (!filters.inStock) count++;
  
  count += filters.itemTypes.length;
  if (filters.size) count++;
  count += filters.woodTypes.length;
  
  return count;
}

export function areFiltersDefault(filters: GalleryFilters): boolean {
  return (
    filters.inStock === DEFAULT_FILTERS.inStock &&
    filters.itemTypes.length === 0 &&
    filters.size === null &&
    filters.woodTypes.length === 0
  );
}
