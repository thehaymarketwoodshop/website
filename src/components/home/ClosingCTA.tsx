import { brand } from '@/content/site';
import { RevealText } from '@/components/motion/RevealText';
import { MagneticButton } from '@/components/ui/MagneticButton';

export function ClosingCTA() {
  return (
    <section aria-labelledby="cta-title" className="on-dark grain grain-dark bg-accent-deep py-[var(--section)] text-on-dark">
      <div className="container-wide relative z-[2] text-center">
        <h2 id="cta-title" className="sr-only">
          Start a project
        </h2>
        <RevealText as="p" className="t-h1 mx-auto max-w-[14ch]" lines={['Let’s make something', '*that outlasts us.*']} />
        <div className="mt-12 flex flex-col items-center gap-8">
          <MagneticButton href="/custom-order" variant="light">
            Begin a commission
          </MagneticButton>
          <p className="text-[0.95rem] text-on-dark-muted">
            Or write to{' '}
            <a href={`mailto:${brand.email}`} className="text-on-dark underline decoration-white/30 underline-offset-4 hover:decoration-white">
              {brand.email}
            </a>
            <span className="block mt-2 sm:inline sm:mt-0"> · {brand.replyTime.toLowerCase()}</span>
          </p>
        </div>
      </div>
    </section>
  );
}
