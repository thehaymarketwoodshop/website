import { MagneticButton } from '@/components/ui/MagneticButton';
import { ArrowLink } from '@/components/ui/ArrowLink';

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] items-center pt-32">
      <div className="container-wide">
        <p className="t-label mb-6 text-muted">404</p>
        <h1 className="t-h1 max-w-[14ch]">
          This page has <em>been planed away.</em>
        </h1>
        <div className="mt-12 flex flex-wrap items-center gap-8">
          <MagneticButton href="/">Return home</MagneticButton>
          <ArrowLink href="/products">Visit the shop</ArrowLink>
        </div>
      </div>
    </section>
  );
}
