import type { Metadata } from 'next';
import Link from 'next/link';
import { Droplets, Sun, Wind, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Care Guide',
  description:
    'How to clean, oil, and protect your Haymarket Woodshop cutting boards and furniture so they last for generations.',
  openGraph: {
    title: 'Care Guide | The Haymarket Woodshop',
    description:
      'How to clean, oil, and protect your Haymarket Woodshop cutting boards and furniture so they last for generations.',
  },
};

// ─── Shared sub-components ───────────────────────────────────────────────────

function StepCard({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-5">
      <div
        className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white mt-0.5"
        style={{ backgroundColor: 'var(--color-walnut)' }}
      >
        {number}
      </div>
      <div>
        <h3 className="text-base font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>
          {title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}>
          {children}
        </p>
      </div>
    </div>
  );
}

function DoCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <CheckCircle size={17} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--color-walnut)' }} />
      <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}>
        {children}
      </p>
    </div>
  );
}

function DontCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <AlertTriangle size={17} className="flex-shrink-0 mt-0.5 text-amber-500" />
      <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}>
        {children}
      </p>
    </div>
  );
}

function SectionDivider({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-10">
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'color-mix(in srgb, var(--color-walnut) 12%, var(--color-ivory))' }}
      >
        <Icon size={22} style={{ color: 'var(--color-walnut)' }} />
      </div>
      <h2 className="text-2xl sm:text-3xl font-semibold" style={{ color: 'var(--color-charcoal)' }}>
        {title}
      </h2>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function CareGuidePage() {
  return (
    <>
      {/* Hero */}
      <section
        className="pt-32 sm:pt-40 pb-16 sm:pb-20"
        style={{ background: 'linear-gradient(to bottom, var(--color-ivory-dark), var(--color-ivory))' }}
      >
        <div className="container-narrow text-center">
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: 'var(--color-walnut)' }}
          >
            Keeping it beautiful
          </p>
          <h1 className="heading-display text-balance" style={{ color: 'var(--color-charcoal)' }}>
            Care Guide
          </h1>
          <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
            Every piece that leaves the shop is built to last — but wood is a living
            material that rewards a little attention. Follow these simple steps to
            keep your cutting boards and furniture looking their best for years to come.
          </p>
        </div>
      </section>

      {/* ── Cutting Boards ──────────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-ivory)' }}
      >
        <div className="container-wide max-w-4xl">

          <SectionDivider icon={Droplets} title="Cutting Boards" />

          {/* Daily cleaning */}
          <div
            className="rounded-2xl p-8 sm:p-10 mb-8"
            style={{ backgroundColor: 'var(--color-ivory-dark)' }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>
              Everyday Cleaning
            </h3>
            <div className="space-y-5">
              <StepCard number={1} title="Rinse immediately after use">
                Rinse the board under warm water and scrub with a soft brush or sponge.
                A drop of dish soap is fine for everyday use — just rinse it off completely.
              </StepCard>
              <StepCard number={2} title="Dry standing upright">
                Never lay the board flat to dry. Stand it on its edge so both sides
                get air circulation and dry evenly, which prevents warping.
              </StepCard>
              <StepCard number={3} title="Sanitize when needed">
                For a deeper clean, sprinkle coarse salt over the board and scrub with
                half a lemon. The salt acts as an abrasive and the lemon juice deodorizes.
                Rinse and dry as usual.
              </StepCard>
            </div>
          </div>

          {/* Oiling */}
          <div
            className="rounded-2xl p-8 sm:p-10 mb-8"
            style={{ backgroundColor: 'var(--color-ivory-dark)' }}
          >
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
              Oiling &amp; Conditioning
            </h3>
            <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 55%, transparent)' }}>
              Oil your board once a month, or whenever the wood looks dry or lighter in color.
            </p>
            <div className="space-y-5">
              <StepCard number={1} title="Choose food-safe mineral oil">
                Use food-grade mineral oil or a beeswax-and-oil board cream. Avoid
                vegetable, olive, or coconut oils — they go rancid inside the wood over time.
              </StepCard>
              <StepCard number={2} title="Apply generously">
                Pour a tablespoon of oil onto the board and spread it with a soft cloth
                or your hands. Cover the entire surface, edges, and back.
              </StepCard>
              <StepCard number={3} title="Let it soak in">
                Leave the oil to absorb for at least 20 minutes — overnight is ideal.
                The wood will soak up as much as it needs.
              </StepCard>
              <StepCard number={4} title="Buff off the excess">
                Wipe away any remaining oil with a clean dry cloth. The surface should
                feel smooth and slightly waxy, not greasy.
              </StepCard>
            </div>
          </div>

          {/* Do / Don't */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-7"
              style={{ backgroundColor: 'var(--color-ivory-dark)' }}
            >
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>
                Do
              </h3>
              <div className="space-y-3">
                <DoCard>Use both sides of the board to wear it evenly</DoCard>
                <DoCard>Re-oil when the wood looks pale or feels rough</DoCard>
                <DoCard>Use a rubber or silicone mat under the board to prevent sliding</DoCard>
                <DoCard>Sand out deep knife marks with 220-grit sandpaper, then re-oil</DoCard>
              </div>
            </div>
            <div
              className="rounded-2xl p-7"
              style={{ backgroundColor: 'var(--color-ivory-dark)' }}
            >
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>
                Don&apos;t
              </h3>
              <div className="space-y-3">
                <DontCard>Put it in the dishwasher — the heat and steam will cause cracking and warping</DontCard>
                <DontCard>Soak it in water or let it sit in a puddle</DontCard>
                <DontCard>Store it next to a heat source like an oven or radiator</DontCard>
                <DontCard>Use vegetable or cooking oils for conditioning</DontCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Furniture ───────────────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-ivory-dark)' }}
      >
        <div className="container-wide max-w-4xl">

          <SectionDivider icon={Sun} title="Tables &amp; Furniture" />

          {/* Daily care */}
          <div
            className="rounded-2xl p-8 sm:p-10 mb-8"
            style={{ backgroundColor: 'var(--color-ivory)' }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>
              Daily Care
            </h3>
            <div className="space-y-5">
              <StepCard number={1} title="Wipe with a damp cloth">
                For everyday dust and spills, wipe the surface with a slightly damp cloth
                and immediately dry with a second cloth. Do not let water sit on the surface.
              </StepCard>
              <StepCard number={2} title="Use coasters and placemats">
                Always use coasters under glasses and placemats under hot dishes. Even
                with a durable finish, prolonged moisture and heat will leave marks over time.
              </StepCard>
              <StepCard number={3} title="Lift, don&apos;t drag">
                Lift objects when moving them across the surface rather than dragging.
                Small particles of grit underneath can scratch the finish.
              </StepCard>
            </div>
          </div>

          {/* Deeper maintenance */}
          <div
            className="rounded-2xl p-8 sm:p-10 mb-8"
            style={{ backgroundColor: 'var(--color-ivory)' }}
          >
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>
              Seasonal Maintenance
            </h3>
            <div className="space-y-5">
              <StepCard number={1} title="Oil-finished pieces (once or twice a year)">
                Apply a thin coat of Danish oil or tung oil with a lint-free cloth,
                following the grain. Allow to dry fully (at least 8 hours) before use.
                This refreshes the color and protects the wood.
              </StepCard>
              <StepCard number={2} title="Poly-finished pieces">
                A light application of furniture wax once or twice a year helps maintain
                the sheen. Apply with a soft cloth, let haze, and buff to a shine.
              </StepCard>
              <StepCard number={3} title="Touch up scratches">
                Shallow surface scratches in an oil finish can often be rubbed out with
                000-steel wool, following the grain, then re-oiling. For poly finishes,
                contact us and we can advise on the best approach.
              </StepCard>
            </div>
          </div>

          {/* Do / Don't */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div
              className="rounded-2xl p-7"
              style={{ backgroundColor: 'var(--color-ivory)' }}
            >
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>
                Do
              </h3>
              <div className="space-y-3">
                <DoCard>Keep furniture away from heating vents and direct sunlight to prevent drying and fading</DoCard>
                <DoCard>Use felt pads under objects that live on the surface</DoCard>
                <DoCard>Re-tighten any loose hardware annually with a screwdriver</DoCard>
                <DoCard>Let us know about any damage — most wood issues are repairable</DoCard>
              </div>
            </div>
            <div
              className="rounded-2xl p-7"
              style={{ backgroundColor: 'var(--color-ivory)' }}
            >
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>
                Don&apos;t
              </h3>
              <div className="space-y-3">
                <DontCard>Use ammonia-based or silicone cleaners — they dull the finish</DontCard>
                <DontCard>Place furniture over floor vents or next to a fireplace</DontCard>
                <DontCard>Let spills sit — blot immediately, then wipe and dry</DontCard>
                <DontCard>Use paper towels for cleaning; they can scratch softer finishes</DontCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Long-term / General ─────────────────────────── */}
      <section
        className="py-20 sm:py-28"
        style={{ backgroundColor: 'var(--color-ivory)' }}
      >
        <div className="container-wide max-w-4xl">

          <SectionDivider icon={Wind} title="Long-Term Care" />

          <div
            className="rounded-2xl p-8 sm:p-10 mb-10"
            style={{ backgroundColor: 'var(--color-ivory-dark)' }}
          >
            <div className="space-y-5">
              <StepCard number={1} title="Wood moves with humidity">
                All solid wood expands and contracts with seasonal changes in humidity.
                This is normal and not a defect. Keeping your home between 35–55% relative
                humidity year-round minimizes this movement and reduces the chance of
                cracking or gapping.
              </StepCard>
              <StepCard number={2} title="Patina is part of the story">
                Over time, most woods — especially walnut and cherry — develop a beautiful
                patina. Walnut lightens slightly and cherry deepens to a rich amber.
                This is the natural aging of the wood and adds to the character of the piece.
              </StepCard>
              <StepCard number={3} title="When in doubt, reach out">
                If something doesn&apos;t look right or you&apos;re unsure how to treat a specific
                finish, just ask. We are always happy to advise on the best way to care
                for your piece.
              </StepCard>
            </div>
          </div>

          {/* CTA */}
          <div
            className="rounded-2xl p-8 sm:p-10 text-center"
            style={{ backgroundColor: 'var(--color-walnut)' }}
          >
            <h3 className="text-xl font-semibold mb-3" style={{ color: 'var(--color-ivory)' }}>
              Have a question about your piece?
            </h3>
            <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--color-ivory) 75%, transparent)' }}>
              We&apos;re happy to help with care advice, touch-ups, or repairs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm transition-colors"
              style={{ backgroundColor: 'var(--color-ivory)', color: 'var(--color-walnut)' }}
            >
              Get in Touch
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
