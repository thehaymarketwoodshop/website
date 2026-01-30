'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';
import { Product } from '@/types/product';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link href={`/products/${product.slug}`} className="block">
        <div className="card overflow-hidden">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100">
            <Image
              src={product.images[0] || '/placeholders/placeholder.jpg'}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={cn(
                'object-cover transition-transform duration-500 ease-out group-hover:scale-105',
                product.soldOut && 'grayscale-sold'
              )}
            />
            {product.soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-neutral-900 text-sm font-medium rounded-full">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="heading-card truncate group-hover:text-neutral-600 transition-colors">
                  {product.name}
                </h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {product.woodType}
                </p>
              </div>
              {product.price && (
                <span className="text-lg font-semibold text-neutral-900 whitespace-nowrap">
                  ${product.price.toLocaleString()}
                </span>
              )}
            </div>

            {/* Purchase Button */}
            <div className="mt-4">
              {product.soldOut ? (
                <button
                  disabled
                  className="w-full px-4 py-2.5 bg-neutral-100 text-neutral-400 text-sm font-medium rounded-full cursor-not-allowed"
                >
                  Sold Out
                </button>
              ) : (
                <a
                  href={product.etsyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Buy on Etsy
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
