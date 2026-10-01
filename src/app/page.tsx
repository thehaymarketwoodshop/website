import { fetchFeaturedProducts, getProductPrice, getProductImages, getWoodTypeFromTags, getSizeFromTags, ShopifyProduct } from '@/lib/shopifyClient';
import { Product } from '@/types/product';
import { Hero } from '@/components/home/Hero';
import { Statement } from '@/components/home/Statement';
import { DisciplineStack } from '@/components/home/DisciplineStack';
import { BoardStory } from '@/components/home/BoardStory';
import { AvailableNow } from '@/components/home/AvailableNow';
import { ProcessTrack } from '@/components/home/ProcessTrack';
import { Materials } from '@/components/home/Materials';
import { Testimonials } from '@/components/home/Testimonials';
import { Studio } from '@/components/home/Studio';
import { ClosingCTA } from '@/components/home/ClosingCTA';

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

// Story: arrive → what we believe → what we make → how it's made → buy now →
// commission it → what it's made from → proof → who we are → begin.
export default async function HomePage() {
  const featured = await fetchFeaturedProducts(4).catch(() => []);
  const products = featured.map(shopifyToProduct);

  return (
    <>
      <Hero />
      <Statement />
      <DisciplineStack />
      <BoardStory />
      <AvailableNow products={products} />
      <ProcessTrack />
      <Materials />
      <Testimonials />
      <Studio />
      <ClosingCTA />
    </>
  );
}
