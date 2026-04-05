import { fetchFeaturedProducts, getProductPrice, getProductImages, getWoodTypeFromTags, getSizeFromTags, ShopifyProduct } from '@/lib/shopifyClient';
import { Product } from '@/types/product';
import { HomePageClient } from './_components/HomePageClient';

export const revalidate = 60;

function shopifyToProduct(p: ShopifyProduct): Product {
  const price = getProductPrice(p);
  const images = getProductImages(p);
  const woodType = getWoodTypeFromTags(p.tags);
  const size = getSizeFromTags(p.tags);
  const variants = p.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.id,
    availableForSale: e.node.availableForSale,
    priceV2: e.node.priceV2,
  }));
  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    category: p.productType || 'Products',
    itemType: p.productType as any,
    size: size as any,
    woodType: woodType as any,
    dimensions: '',
    description: p.description,
    images,
    soldOut: !p.availableForSale,
    featured: true,
    createdAt: '',
    price: price ?? undefined,
    variants,
  } as any;
}

export default async function HomePage() {
  const shopifyFeatured = await fetchFeaturedProducts(4).catch(() => []);
  const featuredProducts: Product[] = shopifyFeatured.map(shopifyToProduct);

  return <HomePageClient featuredProducts={featuredProducts} />;
}
