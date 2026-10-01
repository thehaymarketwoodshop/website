'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';
import { AddToCartButton } from './AddToCartButton';

interface ProductCardProps {
  product: Product;
  index?: number;
  /** Larger editorial treatment for the lead item in a layout. */
  feature?: boolean;
  sizes?: string;
}

type Variant = { id: string; title: string; availableForSale: boolean; priceV2: { amount: string; currencyCode: string } };

export function ProductCard({ product, feature = false, sizes }: ProductCardProps) {
  const variants: Variant[] = (product as Product & { variants?: Variant[] }).variants ?? [];
  const imageSrc = product.images?.[0];

  return (
    <article className="group flex flex-col">
      <Link href={`/products/${product.slug}`} className="block" aria-label={product.name}>
        <div className={cn('relative overflow-hidden bg-surface', feature ? 'aspect-[4/5] lg:aspect-[5/6]' : 'aspect-[4/5]')}>
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={product.name}
              fill
              sizes={sizes ?? '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'}
              className={cn(
                'object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-[1.04]',
                product.soldOut && 'grayscale-sold',
              )}
            />
          ) : (
            <div className="grain absolute inset-0 bg-[url('/media/grain-walnut.jpg')] bg-cover" />
          )}
          {product.soldOut && (
            <span className="t-label absolute left-4 top-4 bg-background px-3 py-2 text-[0.62rem]">Sold</span>
          )}
        </div>
      </Link>
      <div className="mt-5 flex items-baseline justify-between gap-4">
        <h3 className={cn('font-serif font-normal leading-tight', feature ? 'text-[clamp(1.8rem,2.6vw,2.6rem)]' : 'text-2xl')}>
          <Link href={`/products/${product.slug}`} className="hover:text-accent transition-colors">
            {product.name}
          </Link>
        </h3>
        {typeof product.price === 'number' && (
          <span className="whitespace-nowrap text-[0.95rem] tabular-nums">${product.price.toLocaleString()}</span>
        )}
      </div>
      {product.woodType && <p className="mt-1 text-sm capitalize text-muted">{product.woodType}</p>}
      <div className={cn('mt-5', feature ? 'max-w-xs' : '')}>
        {variants.length > 0 ? (
          <AddToCartButton variants={variants} compact />
        ) : (
          <Link href={`/products/${product.slug}`} className="btn-secondary w-full">
            View details
          </Link>
        )}
      </div>
    </article>
  );
}
