import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms & Conditions',
  description: 'The terms that govern use of The Haymarket Woodshop website and store.',
  robots: { index: true, follow: true },
};

const lastUpdated = 'September 7, 2026';

export default function TermsPage() {
  return (
    <div className="pt-32 sm:pt-40 pb-24">
      <div className="container-narrow">
        <h1 className="heading-display mb-2">Terms &amp; Conditions</h1>
        <p className="body-regular mb-12">Last updated: {lastUpdated}</p>

        <div className="space-y-10 body-regular leading-relaxed">
          <section>
            <p>
              These terms govern your use of thehaymarketwoodshop.com (the &ldquo;Site&rdquo;), operated by
              The Haymarket Woodshop, LLC (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By using
              the Site, placing an order, or requesting a custom piece, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Products &amp; Custom Orders</h2>
            <p className="mb-3">
              We sell handcrafted wooden goods through our store, and also take custom, made-to-order
              commissions. Because each custom piece is built specifically for one customer, the scope,
              pricing, and payment schedule for custom work is set out in a separate invoice that you
              review and sign before we begin — the terms on that signed invoice govern that specific
              project. These general terms apply to everything else: browsing the Site, purchasing catalog
              items, and using the contact and custom-order request forms.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Orders &amp; Payment</h2>
            <p>
              Purchases of catalog items are processed through Shopify. By placing an order, you agree to
              Shopify&apos;s own terms of service for payment processing:{' '}
              <a href="https://www.shopify.com/legal/terms" className="link-subtle underline" target="_blank" rel="noopener noreferrer">
                shopify.com/legal/terms
              </a>
              . We reserve the right to refuse or cancel any order, including for suspected fraud or
              pricing errors.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Shipping</h2>
            <p className="mb-3">
              We ship Monday through Friday, excluding holidays. Order details and email updates from us
              will always have the most current status for your specific order.
            </p>

            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>Processing Time</h3>
            <p className="mb-3">
              In-stock items are processed within 3 business days. Made-to-order pieces take 3&ndash;4 weeks
              to build (noted on the product page) and ship within 3 business days of completion.
              We&apos;ll email you as your order moves through each stage.
            </p>

            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>How We Ship</h3>
            <p className="mb-3">
              Smaller items (cutting boards, small goods) go out via standard ground shipping, typically
              arriving in 3&ndash;5 business days. Larger furniture and cabinetry ship by freight carrier,
              since they&apos;re too big for a standard parcel service. For freight deliveries, you can
              choose how far into your home the piece goes — from a simple curbside drop-off up to full
              room-of-choice placement with an appointment. Some of these options add a delivery fee
              (for example, a liftgate to lower heavy items off the truck, or carrying a piece past the
              front door); we&apos;ll always tell you the added cost before you pay for it.
            </p>
            <p className="mb-3">
              Once an order has been prepared for shipment, it can no longer be canceled.
            </p>

            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-charcoal)' }}>Where We Ship</h3>
            <p>
              We currently ship within the contiguous United States only. Alaska and Hawaii are limited to
              standard ground shipping — we&apos;re unable to offer expedited or freight delivery there. We
              can&apos;t ship to P.O. boxes, APO/FPO/DPO military addresses, or international addresses at
              this time.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Returns &amp; Refunds</h2>
            <p className="mb-3">
              <strong>Custom orders are final sale.</strong> Because each custom piece is built specifically
              for you, we&apos;re unable to accept returns or cancellations once work has begun — the
              cancellation terms on your signed invoice govern those projects.
            </p>
            <p>
              For in-stock catalog items, you may return an unused item in its original condition within
              14 days of delivery. A 20% restocking fee applies to all returns to cover inspection and
              return-shipping costs. To start a return, contact us first at the email below.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Warranty</h2>
            <p>
              We stand behind our craftsmanship. Every piece is covered for one year from delivery against
              genuine defects in materials or workmanship — things like a structural joint failure or a
              wood defect that wasn&apos;t visible at the time of sale. This warranty doesn&apos;t cover
              normal wood movement, wear from everyday use, or damage caused by improper care, accidents,
              or misuse. If we determine an issue was caused by user error rather than a defect, we&apos;re
              happy to repair it, but a fee will apply.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Intellectual Property</h2>
            <p>
              The content on this Site — including photos, product designs, and text — belongs to The
              Haymarket Woodshop, LLC unless otherwise noted, and may not be copied or reused without
              permission.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Acceptable Use</h2>
            <p>
              Please don&apos;t use the Site to submit false information, attempt to disrupt or gain
              unauthorized access to it, or use the contact/custom-order forms to send spam or unlawful
              content.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Disclaimer &amp; Limitation of Liability</h2>
            <p>
              The Site and its content are provided &ldquo;as is.&rdquo; Because wood is a natural material,
              minor variations in grain, color, and finish between what&apos;s shown online and the piece
              you receive are normal and not considered defects. To the fullest extent permitted by law,
              The Haymarket Woodshop, LLC is not liable for indirect or consequential damages arising from
              use of the Site or its products.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Governing Law</h2>
            <p>These terms are governed by the laws of the Commonwealth of Virginia.</p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Changes to These Terms</h2>
            <p>
              We may update these terms from time to time. The &ldquo;Last updated&rdquo; date above
              reflects the most recent revision. Continued use of the Site after changes means you accept
              the updated terms.
            </p>
          </section>

          <section>
            <h2 className="heading-card text-xl mb-3">Contact Us</h2>
            <p>
              Questions about these terms? Email us at{' '}
              <a href="mailto:thehaymarketwoodshop@gmail.com" className="link-subtle underline">thehaymarketwoodshop@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
