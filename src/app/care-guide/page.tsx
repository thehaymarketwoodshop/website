import type { Metadata } from 'next';
import Link from 'next/link';
import { Droplets, Sun, Wind, AlertTriangle, CheckCircle, ArrowRight, HelpCircle, Leaf } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Care Instructions & FAQ',
  description:
    'How to clean, oil, and protect your Haymarket Woodshop cutting boards and furniture — plus answers to the most common questions.',
  openGraph: {
    title: 'Care Instructions & FAQ | The Haymarket Woodshop',
    description:
      'How to clean, oil, and protect your Haymarket Woodshop cutting boards and furniture — plus answers to the most common questions.',
  },
};

// ─── Shared sub-components ───────────────────────────────────────────────────

function StepCard({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
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

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
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

function FaqItem({ question, answer }: { question: string; answer: React.ReactNode }) {
  return (
    <div className="border-b last:border-0 pb-6 last:pb-0" style={{ borderColor: 'var(--color-stone)' }}>
      <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
        {question}
      </h3>
      <div className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 65%, transparent)' }}>
        {answer}
      </div>
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
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--color-walnut)' }}>
            Keeping it beautiful
          </p>
          <h1 className="heading-display text-balance" style={{ color: 'var(--color-charcoal)' }}>
            Care Instructions &amp; FAQ
          </h1>
          <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
            Every piece that leaves the shop is built to last — but wood is a living
            material that rewards a little attention. These guidelines will keep your
            boards and furniture looking their best for generations.
          </p>
        </div>
      </section>

      {/* ── Cutting Boards ──────────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="container-wide max-w-4xl">
          <SectionHeader icon={Droplets} title="Cutting Boards" />

          <div className="rounded-2xl p-8 sm:p-10 mb-8" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>Everyday Cleaning</h3>
            <div className="space-y-5">
              <StepCard number={1} title="Rinse immediately after use">
                Rinse under warm water and scrub with a soft brush or sponge. A drop of dish soap is fine for everyday use — just rinse it off completely.
              </StepCard>
              <StepCard number={2} title="Dry standing upright">
                Never lay the board flat to dry. Stand it on its edge so both sides get air circulation and dry evenly, preventing warping.
              </StepCard>
              <StepCard number={3} title="Sanitize when needed">
                Sprinkle coarse salt over the board and scrub with half a lemon. The salt acts as an abrasive and the lemon deodorizes naturally. Rinse and dry as usual.
              </StepCard>
            </div>
          </div>

          <div className="rounded-2xl p-8 sm:p-10 mb-8" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>Oiling &amp; Conditioning</h3>
            <p className="text-sm mb-6" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 50%, transparent)' }}>
              Oil your board once a month, or whenever the wood looks dry or lighter in color.
            </p>
            <div className="space-y-5">
              <StepCard number={1} title="Use food-safe mineral oil">
                Use food-grade mineral oil or a beeswax board cream. Avoid vegetable, olive, or coconut oils — they go rancid inside the wood over time.
              </StepCard>
              <StepCard number={2} title="Apply generously">
                Pour a tablespoon of oil onto the board and spread with a soft cloth. Cover the entire surface, edges, and back.
              </StepCard>
              <StepCard number={3} title="Let it soak in">
                Leave the oil to absorb for at least 20 minutes — overnight is ideal. The wood will take what it needs.
              </StepCard>
              <StepCard number={4} title="Buff off the excess">
                Wipe away remaining oil with a clean dry cloth. The surface should feel smooth and slightly waxy, not greasy.
              </StepCard>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>Do</h3>
              <div className="space-y-3">
                <DoCard>Use both sides of the board to wear it evenly</DoCard>
                <DoCard>Re-oil when the wood looks pale or feels rough</DoCard>
                <DoCard>Use a rubber mat underneath to prevent sliding</DoCard>
                <DoCard>Sand out deep knife marks with 220-grit sandpaper, then re-oil</DoCard>
              </div>
            </div>
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>Don&apos;t</h3>
              <div className="space-y-3">
                <DontCard>Put it in the dishwasher — heat and steam cause cracking and warping</DontCard>
                <DontCard>Soak it in water or let it sit in a puddle</DontCard>
                <DontCard>Store it next to a heat source like an oven or radiator</DontCard>
                <DontCard>Use vegetable or cooking oils for conditioning</DontCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tables & Furniture ──────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
        <div className="container-wide max-w-4xl">
          <SectionHeader icon={Sun} title="Tables &amp; Furniture" />

          <div className="rounded-2xl p-8 sm:p-10 mb-8" style={{ backgroundColor: 'var(--color-ivory)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>Daily Care</h3>
            <div className="space-y-5">
              <StepCard number={1} title="Wipe with a damp cloth">
                For everyday dust and spills, wipe with a slightly damp cloth and immediately dry with a second cloth. Do not let water sit on the surface.
              </StepCard>
              <StepCard number={2} title="Use coasters and placemats">
                Always use coasters under glasses and placemats under hot dishes. Even a durable finish can mark with prolonged moisture or heat.
              </StepCard>
              <StepCard number={3} title="Lift, don&apos;t drag">
                Lift objects when moving them across the surface. Small particles of grit underneath can scratch the finish.
              </StepCard>
            </div>
          </div>

          <div className="rounded-2xl p-8 sm:p-10 mb-8" style={{ backgroundColor: 'var(--color-ivory)' }}>
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--color-charcoal)' }}>Seasonal Maintenance</h3>
            <div className="space-y-5">
              <StepCard number={1} title="Oil-finished pieces (once or twice a year)">
                Apply a thin coat of Danish oil or tung oil with a lint-free cloth, following the grain. Allow to dry fully (at least 8 hours) before use.
              </StepCard>
              <StepCard number={2} title="Poly-finished pieces">
                A light application of furniture wax once or twice a year helps maintain the sheen. Apply with a soft cloth, allow to haze, then buff to a shine.
              </StepCard>
              <StepCard number={3} title="Touch up scratches">
                Shallow scratches in an oil finish can often be rubbed out with 000-steel wool following the grain, then re-oiled. For poly finishes, contact us for advice.
              </StepCard>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--color-ivory)' }}>
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>Do</h3>
              <div className="space-y-3">
                <DoCard>Keep furniture away from heating vents and direct sunlight</DoCard>
                <DoCard>Use felt pads under objects that live on the surface</DoCard>
                <DoCard>Re-tighten any loose hardware annually</DoCard>
                <DoCard>Let us know about any damage — most wood issues are repairable</DoCard>
              </div>
            </div>
            <div className="rounded-2xl p-7" style={{ backgroundColor: 'var(--color-ivory)' }}>
              <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-charcoal)' }}>Don&apos;t</h3>
              <div className="space-y-3">
                <DontCard>Use ammonia-based or silicone cleaners — they dull the finish</DontCard>
                <DontCard>Place furniture over floor vents or near a fireplace</DontCard>
                <DontCard>Let spills sit — blot immediately, wipe and dry</DontCard>
                <DontCard>Use paper towels; they can scratch softer finishes</DontCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Long-Term Care ──────────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="container-wide max-w-4xl">
          <SectionHeader icon={Wind} title="Long-Term Care" />
          <div className="rounded-2xl p-8 sm:p-10" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
            <div className="space-y-5">
              <StepCard number={1} title="Wood moves with humidity">
                All solid wood expands and contracts with seasonal humidity changes. This is normal — not a defect. Keeping your home between 35–55% relative humidity minimizes movement and reduces the risk of cracking or gapping.
              </StepCard>
              <StepCard number={2} title="Patina is part of the story">
                Over time, most woods develop a beautiful patina. Walnut lightens slightly, cherry deepens to a rich amber. This natural aging adds to the character of your piece.
              </StepCard>
              <StepCard number={3} title="When in doubt, reach out">
                If something doesn&apos;t look right or you&apos;re unsure how to treat a specific finish, just ask. We&apos;re always happy to advise on the best approach.
              </StepCard>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
        <div className="container-wide max-w-4xl">
          <SectionHeader icon={HelpCircle} title="Frequently Asked Questions" />

          <div className="rounded-2xl p-8 sm:p-10 space-y-6" style={{ backgroundColor: 'var(--color-ivory)' }}>
            <FaqItem
              question="How often should I oil my cutting board?"
              answer="Once a month is a good rule of thumb for a board used regularly. A simple test: sprinkle a few drops of water on the surface. If the water beads up, the board is well-oiled. If it soaks straight in, it&apos;s time to oil."
            />
            <FaqItem
              question="Can I put my cutting board or serving board in the dishwasher?"
              answer="No. The heat, steam, and prolonged moisture of a dishwasher will cause the wood to crack, warp, and split. Always hand wash and dry immediately."
            />
            <FaqItem
              question="My board has developed a small crack. What should I do?"
              answer="Small hairline cracks are usually a sign the board has dried out. Apply a generous coat of mineral oil and let it soak overnight — this often fills and reduces the crack. If the crack is significant, reach out to us directly."
            />
            <FaqItem
              question="What finish is on my furniture piece?"
              answer="Each piece is finished according to its intended use. Dining tables and high-contact surfaces typically receive a durable poly or hardwax oil finish. Decorative pieces may have a natural oil finish. Your order confirmation will note the specific finish applied, and it is also available in the product details."
            />
            <FaqItem
              question="My table has a water ring. Can I remove it?"
              answer={<>For an oil-finished surface, lightly rub the affected area with 000-steel wool following the grain, then re-apply oil. For a poly finish, try rubbing with a small amount of non-gel toothpaste on a soft cloth — it can gently buff out surface-level marks. If neither works, <Link href="/contact" className="underline" style={{ color: 'var(--color-walnut)' }}>contact us</Link> and we can advise on a more targeted repair.</>}
            />
            <FaqItem
              question="Do you offer refinishing or repair services?"
              answer={<>Yes. Most wood damage — scratches, water stains, worn finish — can be addressed with a refinish. <Link href="/contact" className="underline" style={{ color: 'var(--color-walnut)' }}>Get in touch</Link> with photos of the piece and we&apos;ll let you know what&apos;s possible.</>}
            />
            <FaqItem
              question="Will my piece look exactly like the photos?"
              answer="The studio photography shows the species and style accurately, but because every board and table is cut from a unique section of timber, the exact grain pattern, swirl, and color depth of your piece will be its own. See our Natural Variation notice below for full details."
            />
            <FaqItem
              question="How long will my piece take to arrive?"
              answer="In-stock items typically ship within 3–5 business days. Custom and made-to-order pieces have lead times noted on the individual product page, usually 4–12 weeks depending on complexity. You will receive tracking information as soon as your order ships."
            />
          </div>
        </div>
      </section>

      {/* ── Natural Variation & Character ───────────────── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: 'var(--color-ivory)' }}>
        <div className="container-wide max-w-4xl">
          <SectionHeader icon={Leaf} title="Natural Variation &amp; Character" />

          <div className="rounded-2xl p-8 sm:p-12" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 70%, transparent)' }}>
              Every piece we craft is a unique expression of nature. Because we work exclusively with premium, locally sourced hardwoods, no two boards or tables are identical.
            </p>

            <div className="space-y-5 mb-8">
              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-walnut)' }}
                />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>
                    Grain &amp; Color
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 60%, transparent)' }}>
                    While your piece will be crafted from the specified species (e.g., Black Walnut), the natural grain patterns, swirls, and exact color depth will vary from the studio photography.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div
                  className="flex-shrink-0 w-1.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-walnut)' }}
                />
                <div>
                  <p className="text-sm font-semibold mb-1" style={{ color: 'var(--color-charcoal)' }}>
                    Unique Identity
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 60%, transparent)' }}>
                    Small knots and unique grain structures are not flaws — they are the fingerprints of the wood, ensuring your piece is the only one of its kind in existence.
                  </p>
                </div>
              </div>
            </div>

            {/* Disclaimer box */}
            <div
              className="rounded-xl px-6 py-5 border"
              style={{
                backgroundColor: 'color-mix(in srgb, var(--color-stone) 20%, var(--color-ivory))',
                borderColor: 'var(--color-stone)',
              }}
            >
              <p className="text-xs leading-relaxed" style={{ color: 'color-mix(in srgb, var(--color-charcoal) 55%, transparent)' }}>
                By purchasing, you acknowledge that your piece will possess its own distinct character within our rigorous quality standards. Studio photography is representative of the species and craftsmanship — not a guarantee of an identical grain pattern or color profile.
              </p>
            </div>
          </div>

          {/* Contact CTA */}
          <div
            className="mt-8 rounded-2xl p-8 sm:p-10 text-center"
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
