'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { boardStory } from '@/content/site';
import { ArrowLink } from '@/components/ui/ArrowLink';

// Edge-grain board: contrasting species glued edge to edge.
const STRIPS = ['walnut', 'maple', 'walnut', 'oak', 'walnut', 'maple', 'walnut'] as const;
const GRAIN: Record<(typeof STRIPS)[number], string> = {
  walnut: '/media/grain-walnut.jpg',
  maple: '/media/grain-maple.jpg',
  oak: '/media/grain-oak.jpg',
};

/**
 * Pinned, scrubbed story. The board is drawn in CSS 3D from real-looking grain
 * textures, so it stays crisp at any size and needs no video.
 *   0%  finished board turning slowly
 *  25%  strips part to show the species
 *  50%  strips close: glue-up, flattened, shaped
 *  75%  finish goes on; colour deepens
 * 100%  final state. Scrolling back reverses every step.
 */
export function BoardStory() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, (c) => {
      const desktop = c.conditions?.desktop;
      const strips = gsap.utils.toArray<HTMLElement>('[data-strip]', el);
      const captions = gsap.utils.toArray<HTMLElement>('[data-caption]', el);
      const ticks = gsap.utils.toArray<HTMLElement>('[data-tick]', el);
      const spread = desktop ? 24 : 14;

      gsap.set(captions.slice(1), { autoAlpha: 0, y: 24 });
      gsap.set(ticks, { scaleX: 0, transformOrigin: 'left' });

      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: { trigger: el, start: 'top top', end: desktop ? '+=320%' : '+=240%', pin: true, scrub: 0.8, anticipatePin: 1 },
      });

      // 0 → 1: slow turn
      tl.to('[data-board]', { rotateZ: -22, duration: 1, ease: 'none' }, 0).to(ticks[0], { scaleX: 1, duration: 1, ease: 'none' }, 0);

      // 1 → 2: strips part
      tl.to(captions[0], { autoAlpha: 0, y: -24, duration: 0.3 }, 1)
        .to(captions[1], { autoAlpha: 1, y: 0, duration: 0.3 }, 1.15)
        .to(strips, { x: (i) => (i - 3) * spread, z: (i) => (i % 2 ? 18 : 0), duration: 0.8, stagger: 0.02 }, 1)
        .to('[data-board]', { rotateX: 52, duration: 1 }, 1)
        .to(ticks[1], { scaleX: 1, duration: 1, ease: 'none' }, 1);

      // 2 → 3: glue-up and flatten — a pass of light sweeps the surface
      tl.to(captions[1], { autoAlpha: 0, y: -24, duration: 0.3 }, 2)
        .to(captions[2], { autoAlpha: 1, y: 0, duration: 0.3 }, 2.15)
        .to(strips, { x: 0, z: 0, duration: 0.6, stagger: 0.015 }, 2)
        .fromTo('[data-sweep]', { xPercent: -120, display: 'block' }, { xPercent: 320, duration: 0.8, ease: 'none' }, 2.2)
        .to('[data-board]', { rotateX: 58, duration: 1 }, 2)
        .to(ticks[2], { scaleX: 1, duration: 1, ease: 'none' }, 2);

      // 3 → 4: finish deepens the colour and adds sheen
      tl.to(captions[2], { autoAlpha: 0, y: -24, duration: 0.3 }, 3)
        .to(captions[3], { autoAlpha: 1, y: 0, duration: 0.3 }, 3.15)
        .to('[data-raw]', { opacity: 0, duration: 0.8 }, 3)
        .to('[data-sheen]', { opacity: 1, duration: 0.8 }, 3.1)
        .to('[data-board]', { rotateZ: -14, duration: 1, ease: 'none' }, 3)
        .to(ticks[3], { scaleX: 1, duration: 1, ease: 'none' }, 3);

      return () => tl.scrollTrigger?.kill();
    });
    return () => mm.revert();
  }, []);

  return (
    <section ref={root} aria-labelledby="board-story-title" className="grain relative min-h-[600px] overflow-hidden bg-surface [.js-motion_&]:h-[100svh]">
      <div className="container-wide grid h-full grid-rows-[auto_1fr_auto] gap-4 pb-8 pt-20 md:grid-cols-12 md:grid-rows-1 md:items-center md:gap-8 md:py-0">
        {/* heading */}
        <div className="md:col-span-4 md:self-start md:pt-32">
          <p className="t-label mb-4 text-muted">Anatomy of a board</p>
          <h2 id="board-story-title" className="t-h2 max-w-[12ch]">
            How a cutting board <em>is made.</em>
          </h2>
        </div>

        {/* visual */}
        <div className="relative flex items-center justify-center [perspective:1600px] md:col-span-5 md:h-full" aria-hidden="true">
          <div
            data-board=""
            className="relative h-[min(36svh,440px)] w-[min(50vw,200px)] [transform-style:preserve-3d] md:w-[min(19vw,240px)]"
            style={{ transform: 'rotateX(56deg) rotateZ(-34deg)' }}
          >
            {STRIPS.map((wood, i) => (
              <div
                key={i}
                data-strip=""
                className="absolute inset-y-0 [transform-style:preserve-3d]"
                style={{ left: `${(i / STRIPS.length) * 100}%`, width: `${100 / STRIPS.length + 0.2}%` }}
              >
                <div
                  className="absolute inset-0 bg-cover"
                  style={{ backgroundImage: `url(${GRAIN[wood]})`, backgroundPosition: `${i * 13}% ${i * 7}%`, backgroundSize: '520% 120%' }}
                />
                {/* edge face for thickness */}
                <div
                  className="absolute inset-x-0 bottom-0 h-[22px] origin-bottom bg-cover brightness-75"
                  style={{ backgroundImage: `url(${GRAIN[wood]})`, transform: 'rotateX(-90deg)', backgroundSize: '400% 400%' }}
                />
                <div className="absolute inset-y-0 right-0 w-[22px] origin-right bg-black/30" style={{ transform: 'rotateY(90deg)' }} />
              </div>
            ))}
            {/* raw (unfinished) wash, removed when the finish goes on */}
            <div data-raw="" className="pointer-events-none absolute inset-0 bg-[#efe6d6] opacity-35 mix-blend-soft-light" />
            <div data-sheen="" className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,transparent_30%,rgba(255,240,220,0.35)_48%,transparent_62%)] opacity-0" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div data-sweep="" className="absolute inset-y-0 hidden w-1/3 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)]" />
            </div>
          </div>
        </div>

        {/* captions */}
        <div className="relative z-10 md:col-span-3 md:col-start-10">
          <div className="relative flex flex-col gap-8 [.js-motion_&]:block [.js-motion_&]:min-h-[150px] md:[.js-motion_&]:min-h-[220px]">
            {boardStory.map((s) => (
              <div key={s.kicker} data-caption="" className="[.js-motion_&]:absolute [.js-motion_&]:inset-x-0 [.js-motion_&]:top-0">
                <p className="font-serif text-3xl italic text-accent">{s.kicker}</p>
                <h3 className="mt-3 font-serif text-[clamp(1.6rem,2.2vw,2.1rem)] leading-tight">{s.title}</h3>
                <p className="mt-3 t-body max-w-xs">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 grid grid-cols-4 gap-2" aria-hidden="true">
            {boardStory.map((s) => (
              <span key={s.kicker} className="relative block h-px bg-border">
                <span data-tick="" className="absolute inset-0 bg-foreground" />
              </span>
            ))}
          </div>
          <div className="mt-6">
            <ArrowLink href="/products">Shop cutting boards</ArrowLink>
          </div>
        </div>
      </div>
    </section>
  );
}
