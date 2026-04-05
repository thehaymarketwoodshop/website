import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock } from 'lucide-react';

import {
  fetchProductByHandle,
  getProductPrice,
  getWoodTypeFromTags,
} from '@/lib/shopifyClient';
import { ProductImageGallery } from '../_components/ProductImageGallery';
import { AddToCartButton } from '@/components/AddToCartButton';

export const revalidate = 60;

type PageProps = { params: { slug: string } };

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await fetchProductByHandle(params.slug).catch(() => null);

  if (!product) notFound();

  const price = getProductPrice(product);
  const woodType = getWoodTypeFromTags(product.tags);

  const variants = product.variants.edges.map((e) => ({
    id: e.node.id,
    title: e.node.id,
    availableForSale: e.node.availableForSale,
    priceV2: e.node.priceV2,
  }));

  const images = product.images.edges.map((e) => ({
    url: e.node.url,
    altText: e.node.altText,
  }));

  // Metafields (set these up in Shopify Admin → Content → Metafields → Products)
  const dimensions = product.dimensionsMetafield?.value ?? '';
  const care = product.careMetafield?.value ?? '';
  const materials = product.materialsMetafield?.value ?? '';
  const weight = product.weightMetafield?.value ?? '';
  const leadTime = product.leadTimeMetafield?.value ?? '';

  return (
    <div className="min-h-screen pt-28 sm:pt-36 pb-20">
      <div className="container-wide">

        {/* Breadcrumb */}
        <div className="mb-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <span aria-hidden="true">←</span> Back to products
          </Link>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">

          {/* ── Left: Image gallery ── */}
          <ProductImageGallery images={images} productName={product.title} />

          {/* ── Right: Product details ── */}
          <div className="flex flex-col">

            {/* Category / type badge */}
            {product.productType && (
              <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3">
                {product.productType}
              </span>
            )}

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-semibold text-neutral-900 leading-tight">
              {product.title}
            </h1>

            {/* Wood type */}
            {woodType && (
              <p className="mt-2 text-sm text-neutral-500 capitalize">{woodType}</p>
            )}

            {/* Price */}
            {typeof price === 'number' && (
              <p className="mt-5 text-2xl font-semibold text-neutral-900">
                ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            )}

            {/* Stock status */}
            <div className="mt-3">
              {product.availableForSale ? (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  In stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400">
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  Sold out
                </span>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mt-7">
              <AddToCartButton variants={variants} />
            </div>

            {/* Lead time */}
            {leadTime && (
              <div className="mt-5 flex items-center gap-2 text-sm text-neutral-500">
                <Clock size={15} className="text-neutral-400 flex-shrink-0" />
                <span>Est. lead time: <strong className="text-neutral-700">{leadTime}</strong></span>
              </div>
            )}

            <hr className="my-8 border-neutral-100" />

            {/* Description */}
            {product.description && (
              <div className="mb-8">
                <h2 className="text-base font-semibold text-neutral-900 mb-3">Description</h2>
                <p className="text-sm leading-relaxed text-neutral-600 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {/* Details grid */}
            {(materials || dimensions || weight || care) && (
              <div className="space-y-6">
                <h2 className="text-base font-semibold text-neutral-900">Details</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {materials && (
                    <DetailBlock label="Materials" value={materials} />
                  )}
                  {dimensions && (
                    <DetailBlock label="Dimensions" value={dimensions} />
                  )}
                  {weight && (
                    <DetailBlock label="Weight" value={weight} />
                  )}
                  {care && (
                    <DetailBlock label="Care Instructions" value={care} />
                  )}
                </div>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small helper component ───────────────────────────────────────────────────

function DetailBlock({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
        {label}
      </p>
      <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">{value}</p>
    </div>
  );
}
