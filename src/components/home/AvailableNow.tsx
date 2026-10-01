import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types/product';
import { ProductCard } from '@/components/ProductCard';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { RevealText } from '@/components/motion/RevealText';

/** Shopify products tagged `featured`. One hero piece, the rest as a quiet list. */
export function AvailableNow({ products }: { products: Product[] }) {
  const [lead, ...rest] = products;

  return (
    <section aria-labelledby="available-title" className="py-[var(--section)]">
      <div className="container-wide">
        <div className="mb-14 flex flex-col gap-6 md:mb-20 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="t-label mb-5 text-muted">Available now</p>
            <h2 id="available-title" className="sr-only">
              Available now
            </h2>
            <RevealText as="p" className="t-h2" lines={['Finished pieces,', '*ready to ship.*']} />
          </div>
          <ArrowLink href="/products">Shop all pieces</ArrowLink>
        </div>

        {!lead ? (
          <div className="border-t border-border pt-10">
            <p className="t-lede max-w-xl">New pieces are on the bench. Browse the shop or start a commission in the meantime.</p>
            <div className="mt-6">
              <ArrowLink href="/products">Visit the shop</ArrowLink>
            </div>
          </div>
        ) : (
          <div className="grid-12 gap-y-16">
            <div className="col-span-4 md:col-span-5 lg:col-span-7">
              <ProductCard product={lead} feature sizes="(max-width: 767px) 100vw, 58vw" />
            </div>
            <div className="col-span-4 md:col-span-3 lg:col-span-4 lg:col-start-9">
              {rest.length > 0 ? (
                <ul className="border-t border-border">
                  {rest.map((p) => (
                    <li key={p.id} className="border-b border-border">
                      <Link href={`/products/${p.slug}`} className="group flex items-center gap-5 py-5">
                        <span className="relative block h-20 w-16 flex-none overflow-hidden bg-surface">
                          {p.images?.[0] && (
                            <Image src={p.images[0]} alt="" fill sizes="64px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-serif text-xl group-hover:text-accent">{p.name}</span>
                          {p.woodType && <span className="block text-sm capitalize text-muted">{p.woodType}</span>}
                        </span>
                        {typeof p.price === 'number' && <span className="text-sm tabular-nums">${p.price.toLocaleString()}</span>}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="border-t border-border pt-8">
                  <p className="t-body max-w-sm">
                    Each piece is made in small numbers from the boards on hand, so the grain and color of every one is its own.
                  </p>
                </div>
              )}
              <div className="mt-10 bg-surface p-8">
                <p className="font-serif text-2xl leading-snug">Don’t see the size you need?</p>
                <p className="mt-3 t-body">Most pieces can be made to order in your choice of wood and stain.</p>
                <div className="mt-4">
                  <ArrowLink href="/custom-order">Request a custom size</ArrowLink>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
