import { brand, values } from '@/content/site';
import { RevealText } from '@/components/motion/RevealText';
import { ArrowLink } from '@/components/ui/ArrowLink';

export function Studio() {
  return (
    <section aria-labelledby="studio-title" className="py-[var(--section)]">
      <div className="container-wide grid-12 gap-y-14">
        <div className="col-span-4 md:col-span-8 lg:col-span-6">
          <p className="t-label mb-5 text-muted">The studio</p>
          <h2 id="studio-title" className="sr-only">
            The studio
          </h2>
          <RevealText as="p" className="t-h2" lines={['A small studio', `in *${brand.location}.*`]} />
          <div className="mt-10 max-w-lg space-y-5 t-lede">
            <p>
              The Haymarket Woodshop began with a simple belief: the things we live with every day deserve to be made with care.
            </p>
            <p className="t-body">
              What started as weekends building furniture for family has grown into a full studio practice — combining traditional hand-tool
              techniques with modern machinery, and finishing every piece by hand.
            </p>
          </div>
          <div className="mt-8">
            <ArrowLink href="/about">Read the story</ArrowLink>
          </div>
        </div>

        <ol className="col-span-4 md:col-span-8 lg:col-span-5 lg:col-start-8 lg:pt-24">
          {values.map((v, i) => (
            <li key={v.title} className="grid grid-cols-[3rem_1fr] gap-4 border-t border-border py-7 last:border-b">
              <span className="font-serif text-xl italic text-accent">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-serif text-[1.65rem] leading-tight">{v.title}</h3>
                <p className="mt-2 t-body">{v.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
