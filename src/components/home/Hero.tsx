'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { RevealText } from '@/components/motion/RevealText';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { GrowthRings } from './GrowthRings';
import { brand } from '@/content/site';

export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      // Intro: the rings grow outward from the pith.
      const paths = gsap.utils.toArray<SVGPathElement>('[data-ring]');
      gsap.set(paths, { strokeDasharray: 1, strokeDashoffset: 1 });
      gsap.to(paths, { strokeDashoffset: 0, duration: 2.4, ease: 'power2.inOut', stagger: 0.04, delay: 0.1 });
      gsap.fromTo('[data-hero-fade]', { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 1.2, ease: 'expo.out', stagger: 0.1, delay: 0.75 });

      // Scroll: rings widen and turn; copy lifts away — reverses on the way back up.
      const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 } });
      tl.to('[data-hero-rings]', { scale: 1.45, rotate: 14, opacity: 0.25, ease: 'none' }, 0).to(
        '[data-hero-copy]',
        { yPercent: -18, opacity: 0, ease: 'none' },
        0,
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="on-dark grain grain-dark relative flex min-h-[640px] h-[100svh] flex-col overflow-hidden bg-surface-alt text-on-dark" aria-label="Introduction">
      <div className="pointer-events-none absolute left-1/2 top-[34%] w-[150vw] max-w-[1100px] -translate-x-1/2 -translate-y-1/2 text-accent-soft opacity-40 md:left-[68%] md:top-1/2 md:w-[86vh] md:opacity-90">
        <div data-hero-rings="" className="will-change-transform">
          <GrowthRings className="h-auto w-full" />
        </div>
      </div>

      <div data-hero-copy="" className="container-wide relative z-[2] mt-auto pb-[clamp(40px,8vh,96px)]">
        <p data-hero-fade="" className="t-label mb-7 text-on-dark-muted">
          Custom furniture &amp; cabinetry · {brand.location}
        </p>
        <RevealText as="h1" immediate delay={0.35} className="t-display max-w-[15ch]" lines={['Built once.', '*Kept for generations.*']} />
        <div className="mt-10 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <p data-hero-fade="" className="max-w-md text-[1.0625rem] leading-relaxed text-on-dark-muted">
            Solid hardwood pieces drawn for your home and made by hand — from dining tables and built-ins to the board on your counter.
          </p>
          <div data-hero-fade="" className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <MagneticButton href="/custom-order" variant="light">
              Begin a commission
            </MagneticButton>
            <ArrowLink href="/products">Shop finished pieces</ArrowLink>
          </div>
        </div>
      </div>

      <div data-hero-fade="" className="absolute bottom-6 left-1/2 z-[2] hidden -translate-x-1/2 flex-col items-center gap-3 md:flex" aria-hidden="true">
        <span className="t-label text-[0.62rem] text-on-dark-muted">Scroll</span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/15">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-on-dark [animation:scroll-cue_2.2s_cubic-bezier(0.65,0,0.35,1)_infinite]" />
        </span>
      </div>
    </section>
  );
}
