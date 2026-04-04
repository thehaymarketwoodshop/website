/**
 * Shopify Cart API — client-side only
 * Uses the Storefront API Cart mutations to manage a persistent cart.
 */

const DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ?? '';
const TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ?? '';
const API_URL = DOMAIN ? `https://${DOMAIN}/api/2024-01/graphql.json` : '';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface CartImage {
  url: string;
  altText: string | null;
}

export interface CartLineItem {
  id: string;
  quantity: number;
  merchandise: {
    id: string;
    title: string;
    priceV2: { amount: string; currencyCode: string };
    product: {
      title: string;
      handle: string;
      images: { edges: Array<{ node: CartImage }> };
    };
  };
  cost: {
    totalAmount: { amount: string; currencyCode: string };
  };
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  lines: { edges: Array<{ node: CartLineItem }> };
  cost: {
    subtotalAmount: { amount: string; currencyCode: string };
    totalAmount: { amount: string; currencyCode: string };
  };
}

// ─────────────────────────────────────────────
// INTERNAL FETCH (client-side — no Next.js cache)
// ─────────────────────────────────────────────

async function cartFetch<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify Cart API error: ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`Shopify Cart GraphQL: ${JSON.stringify(json.errors)}`);
  return json.data as T;
}

// ─────────────────────────────────────────────
// FRAGMENT
// ─────────────────────────────────────────────

const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  lines(first: 30) {
    edges {
      node {
        id
        quantity
        merchandise {
          ... on ProductVariant {
            id
            title
            priceV2 { amount currencyCode }
            product {
              title
              handle
              images(first: 1) { edges { node { url altText } } }
            }
          }
        }
        cost {
          totalAmount { amount currencyCode }
        }
      }
    }
  }
  cost {
    subtotalAmount { amount currencyCode }
    totalAmount { amount currencyCode }
  }
`;

// ─────────────────────────────────────────────
// OPERATIONS
// ─────────────────────────────────────────────

/** Create a new cart, optionally with an initial line item */
export async function cartCreate(variantId?: string, quantity = 1): Promise<ShopifyCart> {
  const data = await cartFetch<{ cartCreate: { cart: ShopifyCart } }>(`
    mutation CartCreate($input: CartInput!) {
      cartCreate(input: $input) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }
  `, {
    input: variantId
      ? { lines: [{ merchandiseId: variantId, quantity }] }
      : {},
  });
  return data.cartCreate.cart;
}

/** Fetch an existing cart by ID */
export async function cartGet(cartId: string): Promise<ShopifyCart | null> {
  const data = await cartFetch<{ cart: ShopifyCart | null }>(`
    query CartGet($cartId: ID!) {
      cart(id: $cartId) { ${CART_FRAGMENT} }
    }
  `, { cartId });
  return data.cart;
}

/** Add a line item to an existing cart */
export async function cartLinesAdd(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<ShopifyCart> {
  const data = await cartFetch<{ cartLinesAdd: { cart: ShopifyCart } }>(`
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }
  `, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  return data.cartLinesAdd.cart;
}

/** Update the quantity of a line item (0 = remove) */
export async function cartLinesUpdate(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<ShopifyCart> {
  if (quantity === 0) return cartLinesRemove(cartId, lineId);
  const data = await cartFetch<{ cartLinesUpdate: { cart: ShopifyCart } }>(`
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }
  `, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  return data.cartLinesUpdate.cart;
}

/** Remove a line item from the cart */
export async function cartLinesRemove(cartId: string, lineId: string): Promise<ShopifyCart> {
  const data = await cartFetch<{ cartLinesRemove: { cart: ShopifyCart } }>(`
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart { ${CART_FRAGMENT} }
        userErrors { field message }
      }
    }
  `, { cartId, lineIds: [lineId] });
  return data.cartLinesRemove.cart;
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

export function formatMoney(amount: string, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(parseFloat(amount));
}

export function getCartLines(cart: ShopifyCart): CartLineItem[] {
  return cart.lines.edges.map((e) => e.node);
}
