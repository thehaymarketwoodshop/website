'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ExternalLink, ChevronLeft, ChevronRight, Ruler, TreeDeciduous, Paintbrush, Clock, Heart } from 'lucide-react';
import { Button, ImagePlaceholder } from '@/components';
import { getProductBySlug } from '@/data/products';
import { ITEM_TYPE_LABELS, SIZE_LABELS } from '@/types/product';
import { cn } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const product = getProductBySlug(slug);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!product) {
    notFound();
  }

  const hasMultipleImages = product.images.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  return (
    <>
      {/* Back Navigation */}
      <section className="pt-24 sm:pt-28 pb-4">
        <div className="container-wide">
          <Link
            href="/gallery"
            className="inline-flex items-center text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Gallery
          </Link>
        </div>
      </section>

      {/* Product Content */}
      <section className="pb-24 sm:pb-32">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-100">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0"
                  >
                    {product.images[currentImageIndex] ? (
                      <Image
                        src={product.images[currentImageIndex]}
                        alt={`${product.name} - Image ${currentImageIndex + 1}`}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className={cn(
                          'object-cover',
                          product.soldOut && 'grayscale-sold'
                        )}
                        priority
                      />
                    ) : (
                      <ImagePlaceholder
                        aspectRatio="square"
                        label={product.name}
                        className="w-full h-full"
                      />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Sold Out Overlay */}
                {product.soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="px-6 py-3 bg-white/90 backdrop-blur-sm text-neutral-900 font-medium rounded-full">
                      Sold Out
                    </span>
                  </div>
                )}

                {/* Navigation Arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:bg-white transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-neutral-700 hover:bg-white transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full text-sm text-neutral-700">
                    {currentImageIndex + 1} / {product.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnail Grid */}
              {hasMultipleImages && (
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={cn(
                        'relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden transition-all',
                        currentImageIndex === index
                          ? 'ring-2 ring-neutral-900 ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${product.name} thumbnail ${index + 1}`}
                        fill
                        sizes="80px"
                        className={cn(
                          'object-cover',
                          product.soldOut && 'grayscale-sold'
                        )}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="lg:py-4">
              {/* Category & Type Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 bg-woodshop-100 text-woodshop-700 text-sm font-medium rounded-full">
                  {ITEM_TYPE_LABELS[product.itemType]}
                </span>
                <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-sm font-medium rounded-full">
                  {SIZE_LABELS[product.size]}
                </span>
              </div>

              {/* Title & Price */}
              <h1 className="heading-section">{product.name}</h1>
              {product.price && (
                <p className="mt-2 text-3xl font-semibold text-neutral-900">
                  ${product.price.toLocaleString()}
                </p>
              )}

              {/* Description */}
              <p className="mt-6 body-large">{product.description}</p>

              {/* Specs Grid */}
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <Ruler className="w-5 h-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Dimensions</p>
                    <p className="text-sm text-neutral-600">{product.dimensions}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                  <TreeDeciduous className="w-5 h-5 text-neutral-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-neutral-900">Wood Type</p>
                    <p className="text-sm text-neutral-600">{product.woodType}</p>
                  </div>
                </div>

                {product.finish && (
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <Paintbrush className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Finish</p>
                      <p className="text-sm text-neutral-600">{product.finish}</p>
                    </div>
                  </div>
                )}

                {product.leadTime && (
                  <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-xl">
                    <Clock className="w-5 h-5 text-neutral-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Lead Time</p>
                      <p className="text-sm text-neutral-600">{product.leadTime}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Care Instructions */}
              {product.careInstructions && (
                <div className="mt-6 p-4 bg-woodshop-50 rounded-xl">
                  <div className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-woodshop-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-neutral-900">Care Instructions</p>
                      <p className="text-sm text-neutral-600 mt-1">
                        {product.careInstructions}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Purchase Button */}
              <div className="mt-8">
                {product.soldOut ? (
                  <Button disabled className="w-full sm:w-auto" size="lg">
                    Sold Out
                  </Button>
                ) : (
                  <a
                    href={product.etsyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary inline-flex items-center gap-2 text-lg px-8 py-4"
                  >
                    Buy on Etsy
                    <ExternalLink className="w-5 h-5" />
                  </a>
                )}
              </div>

              {/* Similar Interest CTA */}
              <div className="mt-8 p-6 border border-neutral-200 rounded-2xl">
                <p className="text-neutral-700">
                  Interested in a custom piece similar to this?
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center mt-2 text-neutral-900 font-medium hover:text-neutral-600 transition-colors"
                >
                  Contact us to discuss your project
                  <ArrowLeft className="w-4 h-4 ml-2 rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
