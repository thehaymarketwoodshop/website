'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { ImagePlaceholder } from './ImagePlaceholder';

interface WoodDetailSectionProps {
  title: string;
  description: string;
  bestFor: string;
  lookAndFeel: string;
  imagePath: string;
  imageAlt: string;
}

export function WoodDetailSection({
  title,
  description,
  bestFor,
  lookAndFeel,
  imagePath,
  imageAlt,
}: WoodDetailSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [imgError, setImgError] = useState(false);

  return (
    <div ref={ref}>
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center"
      >
        {/* ─── LEFT: Large Image ─── */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl lg:rounded-3xl shadow-lg ring-1 ring-neutral-900/5 bg-neutral-100">
          {imgError ? (
            <ImagePlaceholder
              aspectRatio="4/3"
              label={imageAlt}
              className="absolute inset-0 w-full h-full !rounded-none"
            />
          ) : (
            <Image
              src={imagePath}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              onError={() => setImgError(true)}
              priority
            />
          )}
        </div>

        {/* ─── RIGHT: Text Content ─── */}
        <div className="flex flex-col justify-center py-2 lg:py-4">
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900"
            style={{ fontFamily: 'var(--font-sf-display)' }}
          >
            {title}
          </h2>

          <p className="mt-5 text-base sm:text-lg text-neutral-600 leading-relaxed">
            {description}
          </p>

          {/* Meta details */}
          <div className="mt-8 space-y-4 border-t border-neutral-100 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
              <span className="text-xs font-semibold text-neutral-900 uppercase tracking-widest shrink-0">
                Best for
              </span>
              <span className="text-neutral-600 leading-relaxed">
                {bestFor}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
              <span className="text-xs font-semibold text-neutral-900 uppercase tracking-widest shrink-0">
                Look &amp; feel
              </span>
              <span className="text-neutral-600 leading-relaxed">
                {lookAndFeel}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
