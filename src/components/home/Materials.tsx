import { woods } from '@/content/site';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { RevealText } from '@/components/motion/RevealText';
import { ArrowLink } from '@/components/ui/ArrowLink';
import { cn } from '@/lib/utils';
import { StainExplorer } from '@/components/StainExplorer';

export function Materials() {
  return (
    <section aria-labelledby="materials-title" className="py-[var(--section)]">
      <div className="container-wide">
        <div className="grid-12 mb-16 gap-y-8 md:mb-24">
          <div className="col-span-4 md:col-span-5 lg:col-span-7">
            <p className="t-label mb-5 text-muted">Materials</p>
            <h2 id="materials-title" className="sr-only">
              Materials
            </h2>
            <RevealText as="p" className="t-h2" lines={['Three hardwoods.', '*Endless character.*']} />
          </div>
          <div className="col-span-4 flex flex-col justify-end gap-2 md:col-span-3 lg:col-span-4 lg:col-start-9">
            <p className="t-body">Domestic hardwoods, sourced from suppliers who care about sustainability and chosen board by board.</p>
            <div className="flex flex-wrap gap-x-8">
              <ArrowLink href="/woods">Our woods</ArrowLink>
              <ArrowLink href="#stains">Stain samples</ArrowLink>
            </div>
          </div>
        </div>

        <ul className="grid-12 gap-y-16">
          {woods.map((w, i) => (
            <li key={w.name} className={cn('col-span-4 md:col-span-4 lg:col-span-4', i === 1 && 'lg:mt-24', i === 2 && 'md:col-start-3 lg:col-start-auto lg:mt-48')}>
              <ParallaxImage src={w.image} alt={`${w.name} grain`} sizes="(max-width: 767px) 100vw, 33vw" className="aspect-[3/4]" reveal strength={10} />
              <div className="mt-6 flex flex-col gap-1 border-t border-border pt-5">
                <h3 className="font-serif text-[2rem] font-normal">{w.name}</h3>
                <span className="t-caption">{w.character}</span>
              </div>
              <p className="mt-3 t-body">{w.body}</p>
              <p className="mt-3 text-sm">
                <span className="text-muted">Best for · </span>
                {w.bestFor}
              </p>
            </li>
          ))}
        </ul>

        <div id="stains" className="mt-[var(--section)] scroll-mt-28 border-t border-border pt-16 md:pt-24">
          <div className="grid-12 mb-12 gap-y-6 md:mb-16">
            <p className="t-label col-span-4 text-muted md:col-span-2 lg:col-span-3">Stain samples</p>
            <h3 className="t-h2 col-span-4 md:col-span-6 lg:col-span-9">
              Then choose <em>the finish.</em>
            </h3>
          </div>
          <StainExplorer />
        </div>
      </div>
    </section>
  );
}
