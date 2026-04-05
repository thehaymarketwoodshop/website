/**
 * Shopify Storefront API client
 *
 * Required environment variables (add to .env.local):
 *   NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN     e.g. my-store.myshopify.com
 *   NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN  (Storefront API access token)
 *
 * To get a Storefront token:
 *   Shopify Admin → Apps → Develop apps → Create app →
 *   Configure Storefront API → enable read_products → copy token
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';
const API_URL = DOMAIN ? `https://${DOMAIN}/api/2024-01/graphql.json` : '';

// ─────────────────────────────────────────────
// INTERNAL FETCH
// ─────────────────────────────────────────────

async function shopifyFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!API_URL || !TOKEN) {
    console.warn(
      '[Shopify] Missing env vars. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN in .env.local',
    );
    return {} as T;
  }

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
  });

  if (!res.ok) {
    throw new Error(`[Shopify] HTTP error ${res.status}: ${res.statusText}`);
  }

  const json = await res.json();
  if (json.errors) {
    throw new Error(`[Shopify] GraphQL error: ${JSON.stringify(json.errors)}`);
  }

  return json.data as T;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface ShopifyImage {
  url: string;
  altText: string | null;
}

export interface ShopifyVariant {
  id: string;
  availableForSale: boolean;
  priceV2: { amount: string; currencyCode: string };
}

export interface ShopifyMetafield {
  value: string;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  description: string;
  productType: string;
  tags: string[];
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: { edges: Array<{ node: ShopifyImage }> };
  variants: { edges: Array<{ node: ShopifyVariant }> };
  // Metafields — only populated on the detail page query
  dimensionsMetafield?: ShopifyMetafield | null;
  careMetafield?: ShopifyMetafield | null;
  materialsMetafield?: ShopifyMetafield | null;
  weightMetafield?: ShopifyMetafield | null;
  leadTimeMetafield?: ShopifyMetafield | null;
}

// ─────────────────────────────────────────────
// GRAPHQL FRAGMENTS
// ─────────────────────────────────────────────

const PRODUCT_CARD_FIELDS = `
  id
  handle
  title
  description
  productType
  tags
  availableForSale
  priceRange {
    minVariantPrice { amount currencyCode }
  }
  images(first: 8) {
    edges { node { url altText } }
  }
  variants(first: 1) {
    edges {
      node {
        id
        availableForSale
        priceV2 { amount currencyCode }
      }
    }
  }
`;

// ─────────────────────────────────────────────
// QUERIES
// ─────────────────────────────────────────────

type AllProductsData = {
  products: { edges: Array<{ node: ShopifyProduct }> };
};

/**
 * Fetch products tagged "featured" in Shopify.
 * To control the homepage Featured Work section:
 *   Shopify Admin → Products → select a product → Tags → add "featured"
 */
export async function fetchFeaturedProducts(limit = 4): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<AllProductsData>(`
    query FeaturedProducts {
      products(first: ${limit}, sortKey: CREATED_AT, reverse: true, query: "tag:featured") {
        edges {
          node { ${PRODUCT_CARD_FIELDS} }
        }
      }
    }
  `);
  return (data?.products?.edges ?? []).map((e) => e.node);
}

/** Fetch all products (for the product grid). Max 100; add cursor pagination if needed. */
export async function fetchAllProducts(): Promise<ShopifyProduct[]> {
  const data = await shopifyFetch<AllProductsData>(`
    query AllProducts {
      products(first: 100, sortKey: CREATED_AT, reverse: true) {
        edges {
          node { ${PRODUCT_CARD_FIELDS} }
        }
      }
    }
  `);
  return (data?.products?.edges ?? []).map((e) => e.node);
}

type ProductByHandleData = { productByHandle: ShopifyProduct | null };

/**
 * Fetch a single product by its handle (slug).
 * Includes metafields for detailed product info.
 *
 * Metafield setup in Shopify Admin → Content → Metafields → Products:
 *   namespace: custom
 *   keys: dimensions | care_instructions | materials | weight_text | lead_time
 */
export async function fetchProductByHandle(
  handle: string,
): Promise<ShopifyProduct | null> {
  const data = await shopifyFetch<ProductByHandleData>(
    `
    query ProductByHandle($handle: String!) {
      productByHandle(handle: $handle) {
        ${PRODUCT_CARD_FIELDS}
        dimensionsMetafield:  metafield(namespace: "custom", key: "dimensions")         { value }
        careMetafield:        metafield(namespace: "custom", key: "care_instructions")  { value }
        materialsMetafield:   metafield(namespace: "custom", key: "materials")          { value }
        weightMetafield:      metafield(namespace: "custom", key: "weight_text")        { value }
        leadTimeMetafield:    metafield(namespace: "custom", key: "lead_time")          { value }
      }
    }
  `,
    { handle },
  );
  return data?.productByHandle ?? null;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function getProductPrice(product: ShopifyProduct): number | null {
  const amount = parseFloat(product.priceRange.minVariantPrice.amount);
  return isNaN(amount) ? null : amount;
}

export function getProductImages(product: ShopifyProduct): string[] {
  return product.images.edges.map((e) => e.node.url).filter(Boolean);
}

/** Returns the Shopify product page URL */
export function getShopifyProductUrl(handle: string): string {
  if (!DOMAIN) return '#';
  return `https://${DOMAIN}/products/${handle}`;
}

/**
 * Returns a direct-to-checkout URL for the first variant.
 * Falls back to the product page if no variant is available.
 */
export function getShopifyCheckoutUrl(product: ShopifyProduct): string {
  const firstVariant = product.variants.edges[0]?.node;
  if (!firstVariant || !DOMAIN) return getShopifyProductUrl(product.handle);
  // Extract numeric ID from GID (gid://shopify/ProductVariant/12345)
  const variantId = firstVariant.id.split('/').pop();
  return `https://${DOMAIN}/cart/${variantId}:1`;
}

// ─────────────────────────────────────────────
// TAG PARSING
// ─────────────────────────────────────────────

/**
 * Parses a single Shopify tag into a { category, value } pair.
 *
 * Supported formats:
 *   "material:Walnut"  → { category: "material", value: "Walnut" }
 *   "size:Small"       → { category: "size",     value: "Small"  }
 *   "item:Table"       → { category: "item",     value: "Table"  }
 *   "shape:Round"      → { category: "shape",    value: "Round"  }
 *   "featured"         → null  (reserved, not a filter)
 *   "Walnut"           → { category: "material", value: "Walnut" } (legacy plain tag)
 *   "Small"            → { category: "size",     value: "Small"  } (legacy plain size)
 */
const PLAIN_SIZES = new Set(['small', 'medium', 'large']);

export function parseTag(tag: string): { category: string; value: string } | null {
  if (!tag) return null;

  // Prefixed tag  e.g. "material:Walnut"
  const colonIdx = tag.indexOf(':');
  if (colonIdx > 0) {
    const category = tag.slice(0, colonIdx).toLowerCase().trim();
    const value = tag.slice(colonIdx + 1).trim();
    if (category && value) return { category, value };
    return null;
  }

  // Reserved plain tag
  if (tag.toLowerCase() === 'featured') return null;

  // Plain size tag (legacy)
  if (PLAIN_SIZES.has(tag.toLowerCase())) {
    return { category: 'size', value: tag };
  }

  // Plain material tag (legacy) — any other tag
  return { category: 'material', value: tag };
}

/**
 * Returns the display value of the first material tag on a product.
 * Strips any prefix, so "material:Walnut" → "Walnut".
 */
export function getWoodTypeFromTags(tags: string[]): string {
  for (const tag of tags) {
    const parsed = parseTag(tag);
    if (parsed?.category === 'material') return parsed.value;
  }
  return '';
}

/** Returns the display value of the first size tag on a product (lowercase). */
export function getSizeFromTags(tags: string[]): string {
  for (const tag of tags) {
    const parsed = parseTag(tag);
    if (parsed?.category === 'size') return parsed.value.toLowerCase();
  }
  return '';
}

/**
 * Derives unique, sorted filter options from all fetched Shopify products.
 *
 * Shopify tag conventions:
 *   productType field  → Item Type filter
 *   item:Table         → also added to Item Type filter
 *   material:Walnut    → Material filter (prefix stripped, shows "Walnut")
 *   size:Small         → Size filter
 *   shape:Round        → Shape filter (any prefix becomes its own filter group)
 *   featured           → ignored (used for homepage only)
 */
const SIZE_ORDER: Record<string, number> = { small: 0, medium: 1, large: 2 };

export function deriveFilterOptions(products: ShopifyProduct[]): {
  itemTypes: { id: string; name: string }[];
  woodTypes: { id: string; name: string }[];
  sizes: { id: string; name: string }[];
} {
  const itemTypeSet = new Set<string>();
  const woodTypeSet = new Set<string>();
  const sizeSet = new Set<string>();

  for (const p of products) {
    // Product type field always becomes an item type option
    if (p.productType) itemTypeSet.add(p.productType);

    for (const tag of p.tags) {
      const parsed = parseTag(tag);
      if (!parsed) continue;

      if (parsed.category === 'item') {
        itemTypeSet.add(parsed.value);
      } else if (parsed.category === 'size') {
        sizeSet.add(parsed.value.toLowerCase());
      } else if (parsed.category === 'material') {
        woodTypeSet.add(parsed.value);
      }
      // other prefixes (shape, finish, etc.) are ignored for now but won't pollute material list
    }
  }

  const toOption = (name: string) => ({ id: name.toLowerCase(), name });

  return {
    itemTypes: Array.from(itemTypeSet).sort().map(toOption),
    woodTypes: Array.from(woodTypeSet).sort().map(toOption),
    sizes: Array.from(sizeSet)
      .sort((a, b) => (SIZE_ORDER[a] ?? 99) - (SIZE_ORDER[b] ?? 99))
      .map(toOption),
  };
}
