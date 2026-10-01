import type { Metadata } from 'next';
import { ContactForm } from '@/components';
import { PageHero } from '@/components/ui/PageHero';
import { brand } from '@/content/site';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with The Haymarket Woodshop about a commission, a finished piece or care advice.',
  openGraph: {
    title: 'Contact | The Haymarket Woodshop',
    description: 'Get in touch with The Haymarket Woodshop about a commission, a finished piece or care advice.',
  },
};

const details = [
  { label: 'Studio', value: brand.location, note: 'Made by hand in our Virginia shop' },
  { label: 'Email', value: brand.email, note: brand.replyTime, href: `mailto:${brand.email}` },
  { label: 'Lead times', value: '2–10 weeks', note: 'Depending on project complexity' },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        label="Contact"
        lines={['Tell us what', '*you have in mind.*']}
        lede="A question about a piece, a commission or care — we would love to hear from you."
      />
      <section className="pb-[var(--section)]">
        <div className="container-wide grid-12 gap-y-16">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <dl className="border-t border-border">
              {details.map((d) => (
                <div key={d.label} className="border-b border-border py-6">
                  <dt className="t-label mb-3 text-muted">{d.label}</dt>
                  <dd className="font-serif text-2xl break-words">
                    {d.href ? (
                      <a href={d.href} className="hover:text-accent">
                        {d.value}
                      </a>
                    ) : (
                      d.value
                    )}
                  </dd>
                  <dd className="mt-1 text-sm text-muted">{d.note}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-10">
              <h2 className="font-serif text-2xl">What to expect</h2>
              <p className="mt-3 t-body">
                After your inquiry we schedule a consultation to talk through the details, then send a quote with a timeline. Once approved,
                your piece is made with regular updates along the way.
              </p>
            </div>
          </div>
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <div className="bg-surface p-[clamp(24px,4vw,56px)]">
              <h2 className="t-h3 mb-8">Send a message</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
