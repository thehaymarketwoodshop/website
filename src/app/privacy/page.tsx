import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How The Haymarket Woodshop collects, uses, and protects your information.',
  robots: { index: true, follow: true },
};

const lastUpdated = 'September 7, 2026';

export default function PrivacyPolicyPage() {
  return (
    <div className="pt-32 sm:pt-40 pb-24">
      <div className="container-narrow">
        <h1 className="heading-display mb-2">Privacy Policy</h1>
        <p className="body-regular mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 body-regular leading-relaxed">
          <section>
            <p>
              The Haymarket Woodshop, LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) operates
              thehaymarketwoodshop.com (the &ldquo;Site&rdquo;). This policy explains what information we
              collect when you use the Site, why we collect it, and how it&apos;s handled.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Information We Collect</h2>
            <p className="mb-3">We collect information directly from you in a few specific places:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Contact form</strong> — name, email address, phone number (optional), and the
                message you send us.
              </li>
              <li>
                <strong>Custom order requests</strong> — name, email address, phone number (optional), a
                description of the project, and an optional reference image you choose to upload.
              </li>
              <li>
                <strong>Invoices</strong> — if we send you an invoice for custom work, it includes billing
                details you or we provide (name, email, billing address). If you sign an invoice, we
                record the name you typed, the email address you provided, the exact date and time, your
                IP address, and your browser&apos;s user agent string, alongside the exact terms you agreed
                to — this creates a record of your acceptance of that invoice&apos;s terms.
              </li>
              <li>
                <strong>Shopping and checkout</strong> — our product catalog and checkout are powered by
                Shopify. When you make a purchase, payment and shipping information is collected and
                processed directly by Shopify, not by us. Shopify&apos;s own privacy policy governs that
                data: <a href="https://www.shopify.com/legal/privacy" className="link-subtle underline" target="_blank" rel="noopener noreferrer">shopify.com/legal/privacy</a>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Cookies and Similar Technology</h2>
            <p className="mb-3">
              Our shopping cart is stored in your browser&apos;s local storage so your selections persist
              between visits — this data stays on your device and isn&apos;t sent to us until you check out.
            </p>
            <p>
              We use Vercel Analytics to understand overall site traffic (e.g. which pages are visited and
              how often). It does not use cookies and does not track you individually across sites.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>To respond to messages sent through the contact or custom-order forms</li>
              <li>To prepare quotes and invoices for custom work you&apos;ve requested</li>
              <li>To maintain a record of signed invoices for our own bookkeeping and as proof of agreement</li>
              <li>To fulfill orders placed through our Shopify store</li>
              <li>To understand overall site usage and improve the Site</li>
            </ul>
            <p className="mt-3">We do not sell your personal information, and we do not use it for advertising.</p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Who We Share Information With</h2>
            <p className="mb-3">We use a small number of service providers to run the Site and our business:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Shopify</strong> — product catalog, checkout, and payment processing</li>
              <li><strong>Supabase</strong> — secure storage of invoices and custom-order requests</li>
              <li><strong>Vercel</strong> — hosting and anonymous traffic analytics</li>
            </ul>
            <p className="mt-3">
              We don&apos;t share your information with anyone else, except where required by law.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Data Retention</h2>
            <p>
              We keep contact and custom-order messages, and invoice records (including signatures), for
              as long as reasonably necessary for our business and legal record-keeping — invoices in
              particular are kept as proof of the agreement you signed.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Your Choices</h2>
            <p>
              You can ask us to review, correct, or delete personal information we hold about you by
              emailing us (see below). We&apos;ll honor reasonable requests, except where we&apos;re
              required to retain records (for example, a signed invoice kept for accounting purposes).
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Children&apos;s Privacy</h2>
            <p>The Site is not directed at children, and we do not knowingly collect information from anyone under 13.</p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. The &ldquo;Last updated&rdquo; date at the top
              reflects the most recent revision.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Contact Us</h2>
            <p>
              Questions about this policy or your information? Email us at{' '}
              <a href="mailto:thehaymarketwoodshop@gmail.com" className="link-subtle underline">thehaymarketwoodshop@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
