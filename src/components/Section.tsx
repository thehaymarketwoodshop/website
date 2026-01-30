'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  background?: 'white' | 'light' | 'warm';
  fullHeight?: boolean;
}

export function Section({
  children,
  className,
  id,
  background = 'white',
  fullHeight = false,
}: SectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section
      ref={ref}
      id={id}
      className={cn(
        'relative w-full',
        {
          'bg-white': background === 'white',
          'bg-neutral-50/50': background === 'light',
          'bg-woodshop-50': background === 'warm',
          'min-h-screen flex flex-col justify-center': fullHeight,
        },
        className
      )}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
      >
        {children}
      </motion.div>
    </section>
  );
}
