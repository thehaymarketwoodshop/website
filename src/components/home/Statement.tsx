'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';

const TEXT =
  'Furniture made the slow way. Boards chosen one at a time, joinery designed to last for generations, finishes worked in by hand — honest materials, never rustic.';

/** Brand statement whose words ink in as you scroll through it. */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll('[data-word]'),
        { opacity: 0.14 },
        { opacity: 1, ease: 'none', stagger: 0.05, scrollTrigger: { trigger: el, start: 'top 78%', end: 'bottom 45%', scrub: true } },
      );
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="py-[var(--section)]" aria-labelledby="statement-label">
      <div className="container-wide grid-12">
        <p id="statement-label" className="t-label col-span-4 mb-10 text-muted md:col-span-2 lg:col-span-3">
          The workshop
        </p>
        <p
          ref={ref}
          className="col-span-4 font-serif text-[clamp(2rem,4.4vw,4.4rem)] font-light leading-[1.12] tracking-[-0.012em] md:col-span-6 lg:col-span-9"
        >
          {TEXT.split(' ').map((w, i) => (
            <span key={i} data-word="">
              {w}{' '}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
