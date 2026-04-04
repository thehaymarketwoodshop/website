import { fetchAllProducts, deriveFilterOptions } from '@/lib/shopifyClient';
import { ProductsContent } from './_components/ProductsContent';

// Revalidate every 60 seconds (ISR) so new Shopify products appear automatically
export const revalidate = 60;

export default async function ProductsPage() {
  const products = await fetchAllProducts().catch((err) => {
    console.error('[Products] Failed to fetch from Shopify:', err);
    return [];
  });

  const { itemTypes, woodTypes } = deriveFilterOptions(products);

  return (
    <ProductsContent
      initialProducts={products}
      itemTypes={itemTypes}
      woodTypes={woodTypes}
    />
  );
}
