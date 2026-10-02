'use client';

import Image from 'next/image';
import { Fragment, useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { disciplines, Discipline } from '@/content/site';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { RevealText } from '@/components/motion/RevealText';
import { cn } from '@/lib/utils';
import { SceneCanvas } from '@/components/scenes/SceneCanvas';

const TONES: Record<Discipline['tone'], string> = {
  espresso: 'on-dark bg-surface-alt text-on-dark grain grain-dark',
  bone: 'bg-surface text-foreground grain',
  ivory: 'bg-background text-foreground grain',
};

function Meta({ d, dark }: { d: Discipline; dark: boolean }) {
  return (
    <dl className={cn('hidden gap-x-10 gap-y-4 border-t pt-5 md:grid md:grid-cols-2', dark ? 'border-white/15' : 'border-border')}>
      {d.meta.map((m) => (
        <div key={m.label}>
          <dt className={cn('t-label mb-2 text-[0.62rem]', dark ? 'text-on-dark-muted' : 'text-muted')}>{m.label}</dt>
          <dd className="text-[0.95rem] leading-snug">{m.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Copy({ d, dark }: { d: Discipline; dark: boolean }) {
  return (
    <div className="flex flex-col gap-5 md:gap-7">
      <p className={cn('t-label', dark ? 'text-on-dark-muted' : 'text-muted')}>
        {d.index} <span className="opacity-50">/ 0{disciplines.length}</span>
      </p>
      <h3 id={`discipline-${d.slug}`} className="t-h1">{d.title}</h3>
      <p className="font-serif text-[clamp(1.35rem,2vw,1.9rem)] italic leading-snug">{d.lede}</p>
      <p className={cn('hidden max-w-md text-[1rem] leading-relaxed md:block', dark ? 'text-on-dark-muted' : 'text-muted')}>{d.body}</p>
      <Meta d={d} dark={dark} />
      <div>
        <ArrowLink href={d.cta.href}>{d.cta.label}</ArrowLink>
      </div>
    </div>
  );
}

function Panel({ d, i }: { d: Discipline; i: number }) {
  const dark = d.tone === 'espresso';
  const sizes = d.layout === 'bleed' ? '100vw' : '(max-width: 767px) 100vw, 58vw';

  return (
    <article
      data-panel=""
      aria-labelledby={`discipline-${d.slug}`}
      className="sticky top-0 h-[100svh] overflow-hidden"
      style={{ zIndex: i + 1 }}
    >
      <div data-panel-inner="" className={cn('relative h-full w-full origin-top overflow-hidden', TONES[d.tone])}>

        {d.layout === 'bleed' ? (
          <>
            <div data-panel-media="" className="absolute inset-0">
              <Image src={d.image} alt={d.imageAlt} fill sizes={sizes} className="object-cover" style={{ objectPosition: d.imagePosition }} />
            </div>
            <div className="absolute inset-0 bg-surface-alt/60" />
            <div className="container-wide relative z-[2] flex h-full flex-col justify-end pb-[clamp(32px,8vh,96px)] pt-28">
              <div className="max-w-2xl">
                <Copy d={d} dark />
              </div>
            </div>
          </>
        ) : (
          <div className={cn('grid h-full md:grid-cols-12 md:grid-rows-1', d.scene ? 'grid-rows-[54%_1fr]' : 'grid-rows-[38%_1fr]')}>
            <div
              data-panel-media=""
              className={cn(
                'relative overflow-hidden md:col-span-7 md:h-full',
                d.layout === 'split-reverse' && 'md:order-2 md:col-start-6',
              )}
            >
              {d.scene ? (
                <SceneCanvas name={d.scene} label={d.sceneLabel ?? d.title} tone={d.tone} fade={d.layout === 'split-reverse' ? 'left' : 'right'} />
              ) : (
                <Image src={d.image} alt={d.imageAlt} fill sizes={sizes} className="object-cover" style={{ objectPosition: d.imagePosition }} />
              )}
            </div>
            <div
              className={cn(
                'relative z-[2] flex flex-col px-[var(--gutter)] md:col-span-5 md:justify-center md:py-24',
                d.scene ? 'justify-start pt-0 pb-8' : 'justify-center py-8',
                d.layout === 'split-reverse' ? 'md:order-1 md:pr-12' : 'md:pl-12 lg:pl-16',
              )}
            >
              <Copy d={d} dark={dark} />
            </div>
          </div>
        )}
        {d.scene && (
          <div className="absolute bottom-6 right-[var(--gutter)] z-[3] hidden w-[min(300px,36%)] md:block" aria-hidden="true">
            <p data-readout-step="" className={cn('t-label mb-2 text-[0.62rem]', dark ? 'text-on-dark-muted' : 'text-muted')}>&nbsp;</p>
            <div className={cn('h-px w-full', dark ? 'bg-white/15' : 'bg-border')}>
              <div data-readout-bar="" className={cn('h-px origin-left scale-x-0', dark ? 'bg-accent-soft' : 'bg-accent')} />
            </div>
          </div>
        )}
        {/* shade deepens as the next panel covers this one */}
        <div data-panel-shade="" className="pointer-events-none absolute inset-0 z-[3] bg-black opacity-0" />
      </div>
    </article>
  );
}

/** Five full-screen panels; each sticks while the next slides over it. */
export function DisciplineStack() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('[data-panel]');
      panels.forEach((panel, i) => {
        const inner = panel.querySelector('[data-panel-inner]');
        const media = panel.querySelector('[data-panel-media]');
        const shade = panel.querySelector('[data-panel-shade]');
        // image eases from 1.12 to 1 as the panel arrives (scenes animate themselves)
        if (media && !media.querySelector('svg')) {
          gsap.fromTo(media, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: panel, start: 'top bottom', end: 'top top', scrub: true } });
        }
        const next = panels[i + 1];
        if (!next) return;
        // recede: scale back, round off, darken while the next panel covers it
        gsap
          .timeline({ scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true } })
          .to(inner, { scale: 0.92, borderRadius: 18, ease: 'none' }, 0)
          .to(shade, { opacity: 0.55, ease: 'none' }, 0);
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="work" aria-label="What we make" className="relative bg-background">
      <div className="container-wide grid-12 pb-16 md:pb-24">
        <p className="t-label col-span-4 mb-6 text-muted md:col-span-2 lg:col-span-3">What we make</p>
        <div className="col-span-4 md:col-span-6 lg:col-span-9">
          <RevealText as="h2" className="t-h2" lines={['Five disciplines.', '*One standard of work.*']} />
        </div>
      </div>
      <div>
        {disciplines.map((d, i) => (
          <Fragment key={d.slug}>
            <Panel d={d} i={i} />
            {/* hold: keeps each panel on screen a while before the next slides over —
                longer for animated pieces so the build plays out and then rests */}
            <div
              data-hold=""
              aria-hidden="true"
              className={cn('hidden [.js-motion_&]:block', d.scene ? 'h-[150svh] md:h-[200svh]' : 'h-[60svh] md:h-[80svh]')}
            />
          </Fragment>
        ))}
      </div>
    </section>
  );
}
