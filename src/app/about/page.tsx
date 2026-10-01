import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ParallaxImage } from '@/components/motion/ParallaxImage';
import { MagneticButton } from '@/components/ui/MagneticButton';
import { brand, values } from '@/content/site';

export const metadata: Metadata = {
  title: 'Studio',
  description: 'The Haymarket Woodshop is a small woodworking studio in Haymarket, Virginia, making heirloom-quality furniture and kitchen goods by hand.',
  openGraph: {
    title: 'Studio | The Haymarket Woodshop',
    description: 'A small woodworking studio in Haymarket, Virginia, making heirloom-quality furniture and kitchen goods by hand.',
  },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        label="The studio"
        lines={['Made with care,', '*meant to be kept.*']}
        lede={`A small woodworking studio in ${brand.location}, dedicated to pieces that matter.`}
      />

      <section className="pb-[var(--section)]">
        <div className="container-wide grid-12 gap-y-14">
          <ParallaxImage
            src="/about/workshop.webp"
            alt="Inside The Haymarket Woodshop studio"
            sizes="(max-width: 1023px) 100vw, 50vw"
            className="col-span-4 aspect-[4/5] md:col-span-5 lg:col-span-6"
            imgClassName="saturate-[0.85]"
            reveal
            priority
          />
          <div className="col-span-4 md:col-span-3 lg:col-span-5 lg:col-start-8 lg:pt-24">
            <h2 className="t-h3 text-[clamp(1.9rem,2.8vw,2.8rem)]">Our story</h2>
            <div className="mt-8 space-y-5 t-body">
              <p className="t-lede !text-foreground">
                The Haymarket Woodshop began with a simple belief: the things we live with every day deserve to be made with care.
              </p>
              <p>
                What started as a weekend hobby building furniture for family has grown into a full studio practice. The mission is the
                same — honest, well-made goods that bring warmth and function to people’s homes.
              </p>
              <p>
                Each piece that leaves the shop is built to be used, loved and eventually passed down. Quality over quantity, details
                done right, and real relationships with the people who trust us with their projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grain bg-surface py-[var(--section)]">
        <div className="container-wide relative z-[2] grid-12 gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p className="t-label mb-5 text-muted">Our approach</p>
            <h2 className="t-h2">
              It begins with <em>a conversation.</em>
            </h2>
          </div>
          <div className="col-span-4 space-y-6 t-body md:col-span-8 lg:col-span-6 lg:col-start-7">
            <p>
              We want to understand not just what you’re looking for, but how the piece will fit into your life — a daily workhorse in the
              kitchen, a centerpiece for family gatherings, a gift to mark a milestone.
            </p>
            <p>
              Materials are selected thoughtfully, from suppliers who practice responsible forestry. We look for boards with character:
              interesting grain, natural edges, the occasional knot that tells a story.
            </p>
            <p>
              The work combines traditional hand-tool techniques with modern machinery. Some operations are better on a machine, but
              there’s no substitute for hand-planing a surface. The result feels both timeless and alive.
            </p>
          </div>
        </div>
      </section>

      <section className="py-[var(--section)]">
        <div className="container-wide">
          <h2 className="t-label mb-10 text-muted">What we value</h2>
          <ol className="grid-12 gap-y-0">
            {values.map((v, i) => (
              <li key={v.title} className="col-span-4 border-t border-border py-8 md:col-span-4 lg:col-span-3">
                <span className="font-serif text-xl italic text-accent">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-4 font-serif text-[1.75rem] leading-tight">{v.title}</h3>
                <p className="mt-3 t-body">{v.body}</p>
              </li>
            ))}
          </ol>
          <div className="mt-20 flex flex-col items-start gap-6 border-t border-border pt-12 md:flex-row md:items-center md:justify-between">
            <p className="font-serif text-[clamp(1.75rem,3vw,2.75rem)] font-light">Have a project in mind?</p>
            <MagneticButton href="/contact">Get in touch</MagneticButton>
          </div>
        </div>
      </section>
    </>
  );
}
