'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { stains, StainWood } from '@/content/site';
import { cn } from '@/lib/utils';

const WOODS = Object.keys(stains) as StainWood[];
const sorted = (wood: StainWood) => [...stains[wood]].sort((a, b) => a.label.localeCompare(b.label));

/**
 * Stain sample viewer: pick a species, then a stain. Every sample image is
 * mounted and cross-faded, so switching is instant and never shifts layout.
 */
export function StainExplorer({ showCta = true }: { showCta?: boolean }) {
  const [wood, setWood] = useState<StainWood>('Walnut');
  const [stain, setStain] = useState(sorted('Walnut')[0].label);
  const options = sorted(wood);

  const pickWood = (w: StainWood) => {
    setWood(w);
    setStain(sorted(w)[0].label);
  };

  return (
    <div className="grid-12 gap-y-10">
      {/* preview */}
      <div className="col-span-4 md:col-span-5 lg:col-span-7">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface">
          {WOODS.flatMap((w) =>
            stains[w].map((s) => {
              const active = w === wood && s.label === stain;
              return (
                <Image
                  key={s.image}
                  src={s.image}
                  alt={active ? `${w} with ${s.label} stain` : ''}
                  aria-hidden={!active}
                  fill
                  sizes="(max-width: 767px) 100vw, 58vw"
                  className={cn(
                    'object-cover transition-[opacity,transform] duration-700 ease-out-expo',
                    active ? 'scale-100 opacity-100' : 'scale-[1.03] opacity-0',
                  )}
                />
              );
            }),
          )}
        </div>
        <p className="mt-4 t-caption" aria-live="polite">
          Showing {wood} — {stain}
        </p>
      </div>

      {/* controls */}
      <div className="col-span-4 flex flex-col gap-10 md:col-span-3 lg:col-span-4 lg:col-start-9">
        <fieldset>
          <legend className="t-label mb-4 text-muted">Wood species</legend>
          <div className="flex gap-6 border-b border-border">
            {WOODS.map((w) => (
              <button
                key={w}
                type="button"
                onClick={() => pickWood(w)}
                aria-pressed={w === wood}
                className={cn(
                  'relative -mb-px min-h-[44px] border-b pb-2 font-serif text-2xl transition-colors',
                  w === wood ? 'border-foreground text-foreground' : 'border-transparent text-muted hover:text-foreground',
                )}
              >
                {w}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="t-label mb-4 text-muted">Stain</legend>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-3">
            {options.map((s) => {
              const active = s.label === stain;
              return (
                <li key={s.label}>
                  <button
                    type="button"
                    onClick={() => setStain(s.label)}
                    aria-pressed={active}
                    className="group block w-full text-left"
                  >
                    <span
                      className={cn(
                        'relative block aspect-square overflow-hidden outline outline-1 outline-offset-2 transition-[outline-color]',
                        active ? 'outline-foreground' : 'outline-transparent group-hover:outline-border',
                      )}
                    >
                      <Image src={s.image} alt="" fill sizes="96px" className="object-cover" />
                    </span>
                    <span className={cn('mt-2 block text-sm', active ? 'text-foreground' : 'text-muted')}>{s.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <p className="t-body text-sm">
          Samples are photographed on real boards. Every piece of wood is unique, so the final color and grain of your piece will vary
          slightly.
        </p>
        {showCta && (
          <Link href="/custom-order" className="link-line link-line--hint self-start text-[0.95rem]">
            <span>Start a piece in {wood} — {stain}</span>
            <svg className="arrow" width="16" height="10" viewBox="0 0 16 10" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
              <path d="M0 5h15M11 1l4 4-4 4" />
            </svg>
          </Link>
        )}
      </div>
    </div>
  );
}
