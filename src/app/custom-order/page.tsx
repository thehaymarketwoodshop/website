import type { Metadata } from 'next';
import { Hammer, Ruler, MessageSquare } from 'lucide-react';
import { Section, CustomOrderForm } from '@/components';

export const metadata: Metadata = {
  title: 'Custom Order',
  description: 'Request a custom, made-to-order piece from The Haymarket Woodshop.',
  openGraph: {
    title: 'Custom Order | The Haymarket Woodshop',
    description: 'Request a custom, made-to-order piece from The Haymarket Woodshop.',
  },
};

const steps = [
  { icon: MessageSquare, title: 'Tell us about it', content: 'Describe what you have in mind, share a reference image or render if you have one.' },
  { icon: Ruler, title: "We'll follow up", content: "We'll reach out to talk through dimensions, wood, finish, and timeline." },
  { icon: Hammer, title: 'Get a quote & sign off', content: "Once we've nailed down the details, we'll send an invoice you can review and sign." },
];

export default function CustomOrderPage() {
  return (
    <>
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
        <div className="container-narrow text-center">
          <h1 className="heading-display">Custom Order</h1>
          <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
            Have something specific in mind — a piece that doesn&apos;t exist in our current lineup? Tell us about it and we&apos;ll build you a quote.
          </p>
        </div>
      </section>

      <Section background="white" className="py-16 sm:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="heading-card text-2xl mb-6">How it works</h2>
              </div>
              <div className="space-y-6">
                {steps.map((step) => (
                  <div key={step.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'var(--color-ivory-dark)' }}>
                      <step.icon className="w-5 h-5" style={{ color: 'var(--color-walnut)' }} />
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--color-charcoal)' }}>{step.title}</h3>
                      <p className="body-regular text-sm">{step.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="card p-8 sm:p-10">
                <h2 className="heading-card text-2xl mb-8">Request a Quote</h2>
                <CustomOrderForm />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
