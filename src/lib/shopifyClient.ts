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

/** Finds a wood-type tag from a product's tags array. */
export function getWoodTypeFromTags(tags: string[]): string {
  const KNOWN_WOOD_TYPES = ['walnut', 'maple', 'oak', 'cherry', 'ash', 'pine', 'cedar'];
  return (
    tags.find((t) => KNOWN_WOOD_TYPES.includes(t.toLowerCase())) ?? ''
  );
}

/** Finds a size tag (Small / Medium / Large) from a product's tags. */
export function getSizeFromTags(tags: string[]): string {
  const SIZES = ['small', 'medium', 'large'];
  return tags.find((t) => SIZES.includes(t.toLowerCase()))?.toLowerCase() ?? '';
}

/**
 * Derives unique, sorted filter options from all fetched products.
 * Item types  → product.productType
 * Wood types  → product.tags (matched against known wood types)
 */
export function deriveFilterOptions(products: ShopifyProduct[]): {
  itemTypes: { id: string; name: string }[];
  woodTypes: { id: string; name: string }[];
} {
  const itemTypeSet = new Set<string>();
  const woodTypeSet = new Set<string>();

  for (const p of products) {
    if (p.productType) itemTypeSet.add(p.productType);
    const wood = getWoodTypeFromTags(p.tags);
    if (wood) woodTypeSet.add(wood);
  }

  const toOption = (name: string) => ({ id: name.toLowerCase(), name });

  return {
    itemTypes: Array.from(itemTypeSet).sort().map(toOption),
    woodTypes: Array.from(woodTypeSet).sort().map(toOption),
  };
}
