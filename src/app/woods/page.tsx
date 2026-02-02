import type { Metadata } from 'next';
import { WoodDetailSection } from "@/components/WoodDetailSection";
import { Paintbrush, Shield, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Our Woods',
  description:
    'We work with a carefully selected range of domestic hardwoods—walnut, oak, and maple—chosen for beauty, durability, and character.',
  openGraph: {
    title: 'Our Woods | The Haymarket Woodshop',
    description:
      'We work with a carefully selected range of domestic hardwoods—walnut, oak, and maple—chosen for beauty, durability, and character.',
  },
};

/* ─── Static data ────────────────────────────────────────────────────────── */

const woods = [
  {
    title: 'Walnut',
    description:
      'Walnut is known for its rich, dark tones and striking grain patterns. Ranging from deep chocolate browns to warm purples, it brings depth and warmth to any space. Smooth and naturally elegant, walnut is ideal for statement pieces and heirloom-quality work.',
    bestFor: 'Tables, desks, cabinetry, accent pieces',
    lookAndFeel: 'Bold, warm, premium',
    imagePath: '/placeholders/walnut.jpg',
    imageAlt: 'Close-up of walnut wood grain',
  },
  {
    title: 'Oak',
    description:
      'Oak is a timeless hardwood valued for its strength and distinctive grain. White oak in particular offers a lighter, more modern appearance while maintaining exceptional durability, making it well suited for everyday use without sacrificing style.',
    bestFor: 'Dining tables, cabinetry, built-ins',
    lookAndFeel: 'Clean, structured, enduring',
    imagePath: '/placeholders/oak.jpg',
    imageAlt: 'Close-up of oak wood grain',
  },
  {
    title: 'Maple',
    description:
      'Maple features a bright, clean appearance with subtle grain and a smooth finish. Its light tone pairs well with modern and minimalist spaces, while its hardness ensures long-lasting performance.',
    bestFor: 'Cutting boards, small goods, contemporary furniture',
    lookAndFeel: 'Light, minimal, precise',
    imagePath: '/placeholders/maple.jpg',
    imageAlt: 'Close-up of maple wood grain',
  },
];

const finishes = [
  {
    icon: Paintbrush,
    title: 'Food-Safe Finish',
    description:
      'For any product that comes into direct contact with food, we use a food-safe, non-toxic finish. This finish protects the wood while preserving its natural color and grain, making it safe for everyday use and easy to maintain.',
    usedFor: 'Cutting boards, charcuterie boards, serving pieces',
  },
  {
    icon: Shield,
    title: 'Matte Furniture Finish',
    description:
      'Our furniture is finished with a high-quality matte finish that provides durability and a clean, modern appearance. It enhances the wood\u2019s natural character while protecting against daily wear without excessive shine.',
    usedFor: 'Tables, desks, furniture, cabinetry exteriors',
  },
  {
    icon: Layers,
    title: 'Cabinet Construction',
    description:
      'For cabinets, we use premium prefinished plywood for the cabinet boxes. This material offers excellent stability, a smooth surface that\u2019s ideal for paint, and a clean, professional interior finish designed to last.',
    usedFor: 'Cabinets',
  },
];

/* ─── Page ───────────────────────────────────────────────────────────────── */

export default function WoodsPage() {
  return (
    <>
      {/* ━━ Page Header ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="pt-32 sm:pt-40 pb-10 sm:pb-14 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 text-center">
          <h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-900"
            style={{ fontFamily: 'var(--font-sf-display)', letterSpacing: '-0.025em' }}
          >
            Our Woods
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto text-balance">
            We work with a carefully selected range of domestic hardwoods, chosen
            for their beauty, durability, and character. Each species brings its
            own personality—subtle or bold, modern or timeless—allowing every
            piece to feel intentional and refined.
          </p>
        </div>
      </section>

      {/* ━━ Wood Sections (Walnut · Oak · Maple) ━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="divide-y divide-neutral-100">
            {woods.map((wood) => (
              <div
                key={wood.title}
                className="py-16 sm:py-20 lg:py-24 first:pt-4 first:sm:pt-8 last:pb-4 last:sm:pb-8"
              >
                <WoodDetailSection
                  title={wood.title}
                  description={wood.description}
                  bestFor={wood.bestFor}
                  lookAndFeel={wood.lookAndFeel}
                  imagePath={wood.imagePath}
                  imageAlt={wood.imageAlt}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━ Custom Wood Requests ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-neutral-100 py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="max-w-3xl">
            <h2
              className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900"
              style={{ fontFamily: 'var(--font-sf-display)' }}
            >
              Custom Wood Requests
            </h2>
            <p className="mt-5 text-base sm:text-lg text-neutral-600 leading-relaxed">
              In addition to walnut, oak, and maple, we&apos;re happy to work
              with a wide range of other hardwoods upon request. If you have a
              specific wood species in mind, we can source the right material to
              bring your vision to life.
            </p>
            <a
              href="/contact"
              className="inline-flex items-center justify-center mt-8 px-6 py-3 bg-neutral-900 text-white font-medium rounded-full hover:bg-neutral-800 active:bg-neutral-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:ring-offset-2"
            >
              Get in Touch
            </a>
          </div>
        </div>
      </section>

      {/* ━━ Finishes & Materials ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <section className="bg-white py-24 sm:py-32">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
          <h2
            className="text-3xl sm:text-4xl font-semibold tracking-tight text-neutral-900 mb-14"
            style={{ fontFamily: 'var(--font-sf-display)' }}
          >
            Finishes &amp; Materials
          </h2>

          <div className="space-y-10">
            {finishes.map((finish) => (
              <div
                key={finish.title}
                className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 sm:p-10"
              >
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 bg-woodshop-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <finish.icon className="w-6 h-6 text-woodshop-700" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900">
                      {finish.title}
                    </h3>
                    <p className="mt-3 text-base sm:text-lg text-neutral-600 leading-relaxed">
                      {finish.description}
                    </p>
                    <div className="mt-4 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-3">
                      <span className="text-xs font-semibold text-neutral-900 uppercase tracking-widest shrink-0">
                        Used for
                      </span>
                      <span className="text-neutral-600">
                        {finish.usedFor}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
