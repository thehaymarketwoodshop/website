'use client';

import { useState } from 'react';
import { testimonials } from '@/content/site';
import { cn } from '@/lib/utils';

function Chevron({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      {dir === 'next' ? <path d="M0 5h15M11 1l4 4-4 4" /> : <path d="M16 5H1M5 1L1 5l4 4" />}
    </svg>
  );
}

/** One quote at a time. All quotes share one grid cell, so switching never shifts layout. */
export function Testimonials() {
  const [active, setActive] = useState(0);
  const go = (d: number) => setActive((a) => (a + d + testimonials.length) % testimonials.length);

  return (
    <section aria-labelledby="testimonials-title" className="bg-surface py-[var(--section)] grain">
      <div className="container-wide relative z-[2] grid-12 gap-y-10">
        <div className="col-span-4 md:col-span-2 lg:col-span-3">
          <h2 id="testimonials-title" className="t-label text-muted">
            From clients
          </h2>
        </div>
        <div className="col-span-4 md:col-span-6 lg:col-span-9">
          <div className="grid" aria-live="polite">
            {testimonials.map((t, i) => (
              <figure
                key={t.author}
                aria-hidden={i !== active}
                className={cn(
                  '[grid-area:1/1] transition-[opacity,transform] duration-700 ease-out-expo',
                  i === active ? 'opacity-100' : 'pointer-events-none translate-y-3 opacity-0',
                )}
              >
                <blockquote className="font-serif text-[clamp(1.75rem,3.4vw,3.4rem)] font-light italic leading-[1.2] tracking-[-0.01em]">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-10 flex flex-wrap gap-x-4 text-[0.95rem]">
                  <span>{t.author}</span>
                  {t.piece && <span className="text-muted">— {t.piece}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="mt-12 flex items-center gap-3">
            <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/30 transition-colors hover:border-foreground">
              <Chevron dir="prev" />
            </button>
            <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="flex h-12 w-12 items-center justify-center rounded-full border border-foreground/30 transition-colors hover:border-foreground">
              <Chevron dir="next" />
            </button>
            <span className="ml-3 text-sm tabular-nums text-muted">
              {String(active + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
