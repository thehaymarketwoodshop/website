import { fetchFeaturedProducts, getProductPrice, getProductImages, getWoodTypeFromTags, getSizeFromTags, ShopifyProduct } from '@/lib/shopifyClient';
import { Product } from '@/types/product';
import { Hero } from '@/components/home/Hero';
import { Statement } from '@/components/home/Statement';
import { AvailableNow } from '@/components/home/AvailableNow';
import { Testimonials } from '@/components/home/Testimonials';
import { Studio } from '@/components/home/Studio';
import { ClosingCTA } from '@/components/home/ClosingCTA';
import { InstagramFeed } from '@/components/home/InstagramFeed';

export const revalidate = 60;

function shopifyToProduct(p: ShopifyProduct): Product {
  return {
    id: p.id,
    name: p.title,
    slug: p.handle,
    category: p.productType || 'Products',
    itemType: p.productType,
    size: getSizeFromTags(p.tags),
    woodType: getWoodTypeFromTags(p.tags),
    dimensions: '',
    description: p.description,
    images: getProductImages(p),
    soldOut: !p.availableForSale,
    featured: true,
    createdAt: '',
    price: getProductPrice(p) ?? undefined,
    variants: p.variants.edges.map((e) => ({
      id: e.node.id,
      title: e.node.id,
      availableForSale: e.node.availableForSale,
      priceV2: e.node.priceV2,
    })),
  } as Product;
}

// Story: arrive → what we believe → buy now → proof → who we are → begin.
export default async function HomePage() {
  const featured = await fetchFeaturedProducts(4).catch(() => []);
  const products = featured.map(shopifyToProduct);

  return (
    <>
      <Hero />
      <Statement />
      <AvailableNow products={products} />
      <InstagramFeed />
      <Testimonials />
      <Studio />
      <ClosingCTA />
    </>
  );
}
