export type ItemType = 'small_goods' | 'tables' | 'cabinets';
export type Size = 'small' | 'medium' | 'large';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  itemType: ItemType;
  size: Size;
  woodType: string;
  dimensions: string;
  description: string;
  images: string[];
  etsyUrl: string;
  soldOut: boolean;
  featured: boolean;
  createdAt: string;
  price?: number;
  finish?: string;
  careInstructions?: string;
  leadTime?: string;
}

export interface GalleryFilters {
  inStock: boolean;
  itemTypes: ItemType[];
  size: Size | null;
  woodTypes: string[];
}

export const DEFAULT_FILTERS: GalleryFilters = {
  inStock: true,
  itemTypes: [],
  size: null,
  woodTypes: [],
};

export const ITEM_TYPE_LABELS: Record<ItemType, string> = {
  small_goods: 'Small Goods',
  tables: 'Tables',
  cabinets: 'Cabinets',
};

export const SIZE_LABELS: Record<Size, string> = {
  small: 'Small',
  medium: 'Medium',
  large: 'Large',
};

// Wood types - add new ones here to automatically update the filter UI
export const WOOD_TYPES = ['Walnut', 'Maple', 'Oak'] as const;
export type WoodType = (typeof WOOD_TYPES)[number];
