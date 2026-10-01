'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { process } from '@/content/site';
import { MagneticButton } from '@/components/ui/MagneticButton';

/** The commission, as a horizontal track pinned on desktop; a plain vertical list on phones. */
export function ProcessTrack() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    const tr = track.current;
    if (!el || !tr || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 1024px)', () => {
      const distance = () => tr.scrollWidth - window.innerWidth;
      const tween = gsap.to(tr, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${distance()}`, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 },
      });
      gsap.utils.toArray<HTMLElement>('[data-step-line]', el).forEach((line) => {
        gsap.fromTo(line, { scaleX: 0 }, {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: line, containerAnimation: tween, start: 'left 85%', end: 'left 35%', scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} id="commission" aria-labelledby="process-title" className="on-dark grain grain-dark overflow-hidden bg-surface-alt text-on-dark">
      <div ref={track} className="flex flex-col lg:h-[100svh] lg:w-max lg:flex-row lg:items-stretch">
        <div className="flex flex-col justify-center px-[var(--gutter)] pb-12 pt-[var(--section)] lg:w-[44vw] lg:py-0">
          <p className="t-label mb-6 text-on-dark-muted">The commission</p>
          <h2 id="process-title" className="t-h2 max-w-[13ch]">
            From a conversation <em>to an heirloom.</em>
          </h2>
          <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-on-dark-muted">
            Four steps, one maker. You work directly with the person building your piece from first sketch to delivery.
          </p>
        </div>

        <ol className="flex flex-col lg:flex-row">
          {process.map((s) => (
            <li key={s.index} className="flex flex-col justify-center px-[var(--gutter)] py-10 lg:w-[34vw] lg:min-w-[380px] lg:px-[3vw] lg:py-0">
              <span className="font-serif text-[clamp(5rem,11vw,10rem)] font-light leading-none text-accent-soft/80 [font-variant-numeric:lining-nums]">{s.index}</span>
              <span className="relative mt-8 block h-px w-full bg-white/15">
                <span data-step-line="" className="absolute inset-0 origin-left bg-on-dark" />
              </span>
              <h3 className="mt-8 font-serif text-[clamp(1.8rem,2.4vw,2.4rem)] leading-tight">{s.title}</h3>
              <p className="mt-4 max-w-sm text-[1rem] leading-relaxed text-on-dark-muted">{s.body}</p>
            </li>
          ))}
        </ol>

        <div className="flex flex-col justify-center gap-8 px-[var(--gutter)] pb-[var(--section)] pt-10 lg:w-[40vw] lg:py-0">
          <p className="font-serif text-[clamp(2rem,3.4vw,3.4rem)] font-light leading-tight">Have something in mind?</p>
          <div>
            <MagneticButton href="/custom-order" variant="light">
              Start a custom order
            </MagneticButton>
          </div>
        </div>
      </div>
    </section>
  );
}
