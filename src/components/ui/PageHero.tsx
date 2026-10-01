import { RevealText } from '@/components/motion/RevealText';

type Props = { label: string; lines: string[]; lede?: string };

/** Shared opening for interior pages: label, masked headline, short lede. */
export function PageHero({ label, lines, lede }: Props) {
  return (
    <section className="pb-16 pt-36 sm:pb-24 sm:pt-48">
      <div className="container-wide grid-12 gap-y-8">
        <p className="t-label col-span-4 text-muted md:col-span-2 lg:col-span-3 lg:pt-6">{label}</p>
        <div className="col-span-4 md:col-span-6 lg:col-span-9">
          <RevealText as="h1" immediate className="t-h1" lines={lines} />
          {lede && <p className="mt-8 max-w-xl t-lede">{lede}</p>}
        </div>
      </div>
    </section>
  );
}
