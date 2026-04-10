import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about The Haymarket Woodshop - our story, our craft, and our commitment to creating heirloom-quality wooden goods.',
  openGraph: {
    title: 'About | The Haymarket Woodshop',
    description:
      'Learn about The Haymarket Woodshop - our story, our craft, and our commitment to creating heirloom-quality wooden goods.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-ivory)' }}>

      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-16 sm:pb-20">
        <div className="container-narrow text-center">
          <h1 className="heading-display">About the Shop</h1>
          <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
            A small woodworking studio in Haymarket, Virginia, dedicated to
            creating pieces that matter.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-24 sm:pb-32">
        <div className="container-narrow">
          <div className="rounded-3xl p-8 sm:p-12 lg:p-16" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>

            {/* Story Section */}
            <div>
              <h2 className="heading-card text-2xl sm:text-3xl mb-6">Our Story</h2>

              <p className="body-large mb-6">
                The Haymarket Woodshop began with a simple belief: that the
                things we live with every day deserve to be made with care.
              </p>

              <p className="body-regular mb-6">
                What started as a weekend hobby building furniture for family
                has grown into a full-fledged studio practice. But the core
                mission remains the same—to create honest, well-made goods that
                bring warmth and function to people&apos;s homes.
              </p>

              <p className="body-regular mb-8">
                Each piece that leaves the shop is built to be used, loved, and
                eventually passed down. We believe in quality over quantity, in
                taking the time to get details right, and in building
                relationships with the people who trust us with their projects.
              </p>
            </div>

            {/* Workshop Image */}
            <div className="my-12 overflow-hidden rounded-2xl shadow-lg">
              <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: '600px' }}>
                <Image
                  src="/about/workshop.webp"
                  alt="The Haymarket Woodshop studio"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                  priority
                />
              </div>
            </div>

            {/* Approach Section */}
            <div>
              <h2 className="heading-card text-2xl sm:text-3xl mb-6">
                Our Approach
              </h2>

              <p className="body-regular mb-6">
                Every project begins with a conversation. We want to understand
                not just what you&apos;re looking for, but how the piece will fit
                into your life. Will it be a daily workhorse in the kitchen? A
                centerpiece for family gatherings? A gift to mark a milestone?
              </p>

              <p className="body-regular mb-6">
                From there, we select materials thoughtfully. We source hardwoods
                from reputable suppliers who practice responsible forestry. We
                look for boards with character—interesting grain patterns,
                natural edges, the occasional knot that tells a story.
              </p>

              <p className="body-regular mb-8">
                The building process combines traditional hand-tool techniques
                with modern machinery. Some operations are more efficient with
                power tools, but there&apos;s no substitute for hand-planing a
                surface or cutting dovetails by eye. The result is furniture
                that feels both timeless and alive.
              </p>
            </div>

            {/* Cutting Board Image */}
            <div className="my-12 overflow-hidden rounded-2xl shadow-lg">
              <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: '600px' }}>
                <Image
                  src="/about/cutting-board.webp"
                  alt="Handcrafted walnut and maple cutting board"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            </div>

            {/* Values */}
            <div>
              <h2 className="heading-card text-2xl sm:text-3xl mb-8">
                What We Value
              </h2>

              <div className="grid sm:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
                    Quality Materials
                  </h3>
                  <p className="body-regular">
                    We work with solid hardwoods—walnut, maple, oak, cherry—sourced
                    from suppliers who care about sustainability.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
                    Honest Construction
                  </h3>
                  <p className="body-regular">
                    No particle board, no veneer, no shortcuts. Our joinery is
                    designed to last for generations.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
                    Thoughtful Design
                  </h3>
                  <p className="body-regular">
                    Form follows function, but beauty matters too. We design
                    pieces that are a pleasure to use and to look at.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>
                    Personal Service
                  </h3>
                  <p className="body-regular">
                    You work directly with the person building your piece. No
                    middlemen, no mysteries.
                  </p>
                </div>
              </div>
            </div>

            {/* Contact CTA */}
            <div className="mt-16 pt-12 border-t text-center" style={{ borderColor: 'var(--color-stone)' }}>
              <p className="body-large mb-6">
                Have a project in mind? We&apos;d love to hear about it.
              </p>
              <a href="/contact" className="btn-primary inline-flex items-center">
                Get in Touch
              </a>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
