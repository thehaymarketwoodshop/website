import Link from 'next/link';

const footerLinks = {
  shop: [
    { href: '/gallery', label: 'Gallery' },
    { href: '/gallery?type=small_goods', label: 'Small Goods' },
    { href: '/gallery?type=tables', label: 'Tables' },
    { href: '/gallery?type=cabinets', label: 'Cabinets' },
  ],
  company: [
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-50/50">
      <div className="container-wide py-16 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          {/* Brand Column */}
          <div className="md:col-span-2">
            <Link
              href="/"
              className="text-xl font-semibold tracking-tight text-neutral-900"
            >
              The Haymarket Woodshop
            </Link>
            <p className="mt-4 text-neutral-600 max-w-sm leading-relaxed">
              Handcrafted wooden goods made with care and attention to detail.
              Each piece is built to become a cherished part of your home.
            </p>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              Shop
            </h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-neutral-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-500">
              © {new Date().getFullYear()} The Haymarket Woodshop. All rights reserved.
            </p>
            <p className="text-sm text-neutral-500">
              Handcrafted in Haymarket, Virginia
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
