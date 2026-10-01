'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { cn } from '@/lib/utils';
import { Arrow, SlideLabel } from './ArrowLink';

type Props = {
  href: string;
  children: string;
  variant?: 'primary' | 'light';
  className?: string;
};

/** Primary CTA. Drifts toward a fine pointer; inert on touch and reduced motion. */
export function MagneticButton({ href, children, variant = 'primary', className }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia('(pointer: fine)').matches) return;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * 0.25);
      yTo((e.clientY - (r.top + r.height / 2)) * 0.35);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <Link ref={ref} href={href} className={cn(variant === 'light' ? 'btn-light' : 'btn-primary', className)}>
      <SlideLabel>{children}</SlideLabel>
      <Arrow />
    </Link>
  );
}
