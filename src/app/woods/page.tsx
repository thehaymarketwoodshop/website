import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { StainExplorer } from '@/components/StainExplorer';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { woods, finishes } from '@/content/site';
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Materials',
  description:
    'Walnut, white oak and maple — chosen for beauty, durability and character. Preview every stain sample and learn about our finishes.',
  openGraph: {
    title: 'Materials | The Haymarket Woodshop',
    description: 'Walnut, white oak and maple, every stain sample, and the finishes we use.',
  },
};

export default function WoodsPage() {
  return (
    <>
      <PageHero
        label="Materials"
        lines={['Chosen for beauty,', '*built for character.*']}
        lede="A carefully selected range of domestic hardwoods — each with its own personality, subtle or bold, modern or timeless."
      />

      {/* Species */}
      <section aria-label="Wood species" className="pb-[var(--section)]">
        <div className="container-wide flex flex-col gap-[clamp(80px,10vw,160px)]">
          {woods.map((w, i) => (
            <article key={w.name} className="grid-12 items-center gap-y-10">
              <ParallaxImage
                src={w.image}
                alt={`${w.name} grain`}
                sizes="(max-width: 767px) 100vw, 50vw"
                className={cn('col-span-4 aspect-[4/3] md:col-span-4 lg:col-span-6', i % 2 === 1 && 'md:order-2 md:col-start-5 lg:col-start-7')}
                reveal
              />
              <div className={cn('col-span-4 md:col-span-4 lg:col-span-5', i % 2 === 1 ? 'md:order-1 lg:col-start-1' : 'lg:col-start-8')}>
                <p className="t-label mb-4 text-muted">0{i + 1}</p>
                <h2 className="t-h2">{w.name}</h2>
                <p className="mt-3 font-serif text-2xl italic">{w.character}</p>
                <p className="mt-6 t-body">{w.body}</p>
                <dl className="mt-8 border-t border-border pt-5">
                  <dt className="t-label mb-2 text-[0.62rem] text-muted">Best for</dt>
                  <dd>{w.bestFor}</dd>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Stain samples */}
      <section id="stains" aria-labelledby="stains-title" className="grain scroll-mt-20 bg-surface py-[var(--section)]">
        <div className="container-wide relative z-[2]">
          <div className="grid-12 mb-12 gap-y-6 md:mb-16">
            <p className="t-label col-span-4 text-muted md:col-span-2 lg:col-span-3">Stain samples</p>
            <div className="col-span-4 md:col-span-6 lg:col-span-9">
              <h2 id="stains-title" className="t-h2">
                See every stain <em>on real wood.</em>
              </h2>
              <p className="mt-6 max-w-xl t-lede">Preview how each stain looks on walnut, oak and maple before you commission.</p>
            </div>
          </div>
          <StainExplorer />
        </div>
      </section>

      {/* Finishes */}
      <section aria-labelledby="finishes-title" className="py-[var(--section)]">
        <div className="container-wide grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p className="t-label mb-5 text-muted">Finishes</p>
            <h2 id="finishes-title" className="t-h2">
              Finishes <em>&amp; construction.</em>
            </h2>
          </div>
          <ol className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            {finishes.map((f, i) => (
              <li key={f.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border py-8 last:border-b">
                <span className="font-serif text-xl italic text-accent">0{i + 1}</span>
                <div>
                  <h3 className="font-serif text-[1.75rem] leading-tight">{f.title}</h3>
                  <p className="mt-3 t-body">{f.body}</p>
                  <p className="mt-3 text-sm">
                    <span className="text-muted">Used for · </span>
                    {f.usedFor}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Custom species */}
      <section className="on-dark grain grain-dark bg-surface-alt py-[var(--section)] text-on-dark">
        <div className="container-wide relative z-[2] grid-12 gap-y-10">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <p className="t-label mb-5 text-on-dark-muted">Custom wood requests</p>
            <h2 className="t-h2">
              Have another species <em>in mind?</em>
            </h2>
            <p className="mt-6 max-w-xl text-[1.0625rem] leading-relaxed text-on-dark-muted">
              Beyond walnut, oak and maple, we’re happy to work with a wide range of other hardwoods on request — and can source the right
              material for your piece.
            </p>
          </div>
          <div className="col-span-4 flex items-end md:col-span-8 lg:col-span-4 lg:col-start-9 lg:justify-end">
            <MagneticButton href="/contact" variant="light">
              Get in touch
            </MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
