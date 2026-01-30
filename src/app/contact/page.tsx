import type { Metadata } from 'next';
import { MapPin, Mail, Clock } from 'lucide-react';
import { Section, ContactForm } from '@/components';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with The Haymarket Woodshop. We would love to hear about your project or answer any questions.',
  openGraph: {
    title: 'Contact | The Haymarket Woodshop',
    description:
      'Get in touch with The Haymarket Woodshop. We would love to hear about your project.',
  },
};

const contactInfo = [
  {
    icon: MapPin,
    title: 'Location',
    content: 'Haymarket, Virginia',
    subtext: 'By appointment only',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'hello@haymarketwoodshop.com',
    subtext: 'We reply within 24 hours',
  },
  {
    icon: Clock,
    title: 'Lead Times',
    content: '2-10 weeks',
    subtext: 'Depending on project complexity',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 sm:pt-40 pb-12 sm:pb-16 bg-gradient-to-b from-woodshop-50 to-white">
        <div className="container-narrow text-center">
          <h1 className="heading-display">Get in Touch</h1>
          <p className="mt-6 body-large max-w-2xl mx-auto text-balance">
            Have a project in mind? Questions about our work? We would love to
            hear from you.
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <Section background="white" className="py-16 sm:py-24">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="heading-card text-2xl mb-6">Contact Information</h2>
                <p className="body-regular">
                  Fill out the form and we will get back to you as soon as
                  possible. For custom projects, please include details about
                  what you are looking for—dimensions, wood preferences, and any
                  inspiration images are helpful.
                </p>
              </div>

              <div className="space-y-6">
                {contactInfo.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-woodshop-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-woodshop-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-neutral-900">
                        {item.title}
                      </h3>
                      <p className="text-neutral-700">{item.content}</p>
                      <p className="text-sm text-neutral-500">{item.subtext}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Additional Note */}
              <div className="p-6 bg-neutral-50 rounded-2xl">
                <h3 className="font-semibold text-neutral-900 mb-2">
                  What to Expect
                </h3>
                <p className="text-sm text-neutral-600 leading-relaxed">
                  After receiving your inquiry, we will schedule a consultation
                  to discuss your project in detail. From there, we will provide
                  a detailed quote with timeline. Once approved, we will begin
                  crafting your piece with regular updates along the way.
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="card p-8 sm:p-10">
                <h2 className="heading-card text-2xl mb-8">Send a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Section>
    </>
  );
}
