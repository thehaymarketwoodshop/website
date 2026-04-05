'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Hammer, Ruler, TreeDeciduous, Sparkles, Quote } from 'lucide-react';
import { Button, ProductCard, ImagePlaceholder } from '@/components';
import { Product } from '@/types/product';

const services = [
  {
    icon: Hammer,
    title: 'Custom Furniture',
    description: 'Tables, benches, and shelving built to your exact specifications.',
  },
  {
    icon: Ruler,
    title: 'Cutting Boards',
    description: 'Functional art for your kitchen, from edge grain to end grain designs.',
  },
  {
    icon: TreeDeciduous,
    title: 'Cabinetry',
    description: 'Storage solutions that blend seamlessly with your home.',
  },
  {
    icon: Sparkles,
    title: 'Small Goods',
    description: 'Jewelry boxes, serving trays, and thoughtful gifts.',
  },
];

const testimonials = [
  {
    quote: 'The craftsmanship is extraordinary. Our dining table has become the heart of our home.',
    author: 'Sarah M.',
    location: 'Fairfax, VA',
  },
  {
    quote: 'I commissioned a cutting board as a wedding gift. The couple was absolutely thrilled.',
    author: 'Michael T.',
    location: 'Haymarket, VA',
  },
  {
    quote: 'Professional, patient, and incredibly talented. The media console exceeded all expectations.',
    author: 'Jennifer L.',
    location: 'Gainesville, VA',
  },
];

// Shared shadow that makes each stacked card look elevated
const stackShadow = '0 -8px 32px 0 rgba(28,28,28,0.10)';

interface HomePageClientProps {
  featuredProducts: Product[];
}

export function HomePageClient({ featuredProducts }: HomePageClientProps) {
  return (
    <>
      {/* ── 1. Hero ─────────────────────────────────────── */}
      {/* No wrapper needed — hero is the first section and doesn't need to slide over anything */}
      <section
        className="sticky top-0 min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          zIndex: 10,
          background: 'linear-gradient(to bottom, var(--color-ivory-dark), var(--color-ivory))',
        }}
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgb(107 74 45 / 0.15) 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>

        <div className="container-wide relative z-10 pt-32 pb-20 sm:pt-40 sm:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-4xl mx-auto text-center"
          >
            <h1 className="heading-display text-balance" style={{ color: 'var(--color-charcoal)' }}>
              The Haymarket Woodshop
            </h1>
            <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
              Handcrafted wooden goods made with intention. Each piece is built to
              become a cherished part of your home, designed to last for generations.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/gallery">
                <Button size="lg">
                  View Gallery
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="secondary" size="lg">
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Featured Work ────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 20 }}>
        <section
          className="sticky top-0 py-24 sm:py-32"
          style={{
            backgroundColor: 'var(--color-ivory)',
            borderRadius: '2rem 2rem 0 0',
            boxShadow: stackShadow,
          }}
        >
          <div className="container-wide">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
              <div>
                <h2 className="heading-section">Featured Work</h2>
                <p className="mt-3 body-regular max-w-xl">
                  {featuredProducts.length > 0
                    ? 'A selection of featured pieces from the shop.'
                    : 'A selection of recent pieces from the shop.'}
                </p>
              </div>
              <Link
                href="/products"
                className="inline-flex items-center font-medium transition-colors group"
                style={{ color: 'var(--color-walnut)' }}
              >
                View all products
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {featuredProducts.map((product, index) => (
                  <ProductCard key={product.id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="body-regular mb-2" style={{ color: 'var(--color-stone)' }}>
                  No featured products yet.
                </p>
                <p className="text-sm" style={{ color: 'var(--color-stone)' }}>
                  In Shopify Admin, add the tag <strong>featured</strong> to any product to show it here.
                </p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ── 3. What We Make ─────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 30 }}>
        <section
          className="sticky top-0 py-24 sm:py-32"
          style={{
            backgroundColor: 'var(--color-ivory-dark)',
            borderRadius: '2rem 2rem 0 0',
            boxShadow: stackShadow,
          }}
        >
          <div className="container-wide">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <h2 className="heading-section">What We Make</h2>
              <p className="mt-4 body-regular">
                From small kitchen goods to substantial furniture pieces, every item
                is crafted with the same attention to detail.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {services.map((service, index) => (
                <motion.div
                  key={service.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-8 text-center"
                >
                  <div
                    className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6"
                    style={{ backgroundColor: 'color-mix(in srgb, var(--color-walnut) 12%, var(--color-ivory))' }}
                  >
                    <service.icon className="w-7 h-7" style={{ color: 'var(--color-walnut)' }} />
                  </div>
                  <h3 className="heading-card mb-3">{service.title}</h3>
                  <p className="body-regular">{service.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 4. Built by Hand ────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 40 }}>
        <section
          className="sticky top-0 py-24 sm:py-32"
          style={{
            backgroundColor: 'var(--color-ivory)',
            borderRadius: '2rem 2rem 0 0',
            boxShadow: stackShadow,
          }}
        >
          <div className="container-wide">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="heading-section">
                  Built by Hand,
                  <br />
                  <span style={{ color: 'var(--color-walnut)' }}>Made to Last</span>
                </h2>
                <p className="mt-6 body-large">
                  Every piece begins as raw lumber—carefully selected for grain
                  pattern, stability, and character.
                </p>
                <p className="mt-4 body-regular">
                  Using traditional joinery techniques alongside modern precision
                  tools, each item is shaped, smoothed, and finished by hand. The
                  result is furniture and goods that will serve you for decades,
                  developing a rich patina over time.
                </p>
                <p className="mt-4 body-regular">
                  We believe in honest materials, thoughtful design, and
                  construction that does not cut corners. When you commission a
                  piece from The Haymarket Woodshop, you are investing in
                  something that can be passed down through generations.
                </p>
                <Link href="/about" className="inline-block mt-8">
                  <Button variant="secondary">
                    Learn More About Us
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ImagePlaceholder
                  aspectRatio="4/3"
                  label="Workshop image"
                  className="shadow-2xl"
                />
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* ── 5. Testimonials ─────────────────────────────── */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <section
          className="sticky top-0 py-24 sm:py-32"
          style={{
            backgroundColor: 'var(--color-ivory-dark)',
            borderRadius: '2rem 2rem 0 0',
            boxShadow: stackShadow,
          }}
        >
          <div className="container-wide">
            <div className="text-center mb-16">
              <h2 className="heading-section">What Clients Say</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.blockquote
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="card p-8"
                  style={{ backgroundColor: 'var(--color-ivory)' }}
                >
                  <Quote className="w-8 h-8 mb-4" style={{ color: 'var(--color-stone)' }} />
                  <p className="text-lg leading-relaxed mb-6" style={{ color: 'var(--color-charcoal)' }}>
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <footer>
                    <p className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{testimonial.author}</p>
                    <p className="text-sm" style={{ color: 'var(--color-stone)' }}>{testimonial.location}</p>
                  </footer>
                </motion.blockquote>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* ── 6. CTA ──────────────────────────────────────── */}
      {/* Last section — not sticky, just sits at the end */}
      <section
        className="py-24 sm:py-32"
        style={{
          backgroundColor: 'var(--color-walnut)',
          borderRadius: '2rem 2rem 0 0',
          position: 'relative',
          zIndex: 60,
          boxShadow: stackShadow,
        }}
      >
        <div className="container-narrow text-center">
          <h2 className="heading-section" style={{ color: 'var(--color-ivory)' }}>
            Ready to Start Your Project?
          </h2>
          <p className="mt-4 body-large max-w-xl mx-auto" style={{ color: 'color-mix(in srgb, var(--color-ivory) 80%, transparent)' }}>
            Whether you have a specific design in mind or need help bringing your
            vision to life, we would love to hear from you.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/contact">
              <button
                className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-base transition-colors"
                style={{ backgroundColor: 'var(--color-ivory)', color: 'var(--color-walnut)' }}
              >
                Contact Us
                <ArrowRight className="ml-2 w-5 h-5" />
              </button>
            </Link>
            <Link href="/products">
              <button
                className="inline-flex items-center px-8 py-3 rounded-full font-semibold text-base border-2 transition-colors"
                style={{ borderColor: 'var(--color-ivory)', color: 'var(--color-ivory)' }}
              >
                Browse Products
              </button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
