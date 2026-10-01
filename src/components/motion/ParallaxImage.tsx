'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';

type Props = {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  /** Percentage the image drifts across the frame while it passes the viewport. */
  strength?: number;
  /** Open with a clip-path wipe when it first enters. */
  reveal?: boolean;
  priority?: boolean;
  imgClassName?: string;
};

/** Frame with a slow parallax drift and an optional clip-path reveal. The frame reserves its size, so no layout shift. */
export function ParallaxImage({ src, alt, sizes, className, strength = 8, reveal = false, priority, imgClassName }: Props) {
  const frame = useRef<HTMLDivElement>(null);
  const inner = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!frame.current || !inner.current || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const mobile = window.matchMedia('(max-width: 767px)').matches;
      const s = mobile ? strength / 2 : strength;
      gsap.fromTo(
        inner.current,
        { yPercent: -s },
        { yPercent: s, ease: 'none', scrollTrigger: { trigger: frame.current, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      if (reveal) {
        gsap.fromTo(
          frame.current,
          { clipPath: 'inset(12% 8% 12% 8%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: frame.current, start: 'top 85%', once: true } },
        );
      }
    }, frame);
    return () => ctx.revert();
  }, [strength, reveal]);

  return (
    <div ref={frame} className={cn('relative overflow-hidden', className)}>
      <div ref={inner} className="absolute inset-x-0 -inset-y-[12%]">
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn('object-cover', imgClassName)} />
      </div>
    </div>
  );
}
