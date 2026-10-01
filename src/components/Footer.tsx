import Link from 'next/link';
import { brand, nav, secondaryNav, legalNav } from '@/content/site';

export function Footer() {
  return (
    <footer className="bg-background pt-24 sm:pt-32">
      <div className="container-wide">
        <div className="grid-12 gap-y-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-6">
            <p className="font-serif text-[clamp(2.75rem,6vw,5.5rem)] font-light leading-[0.95] tracking-[-0.02em]">
              The Haymarket
              <br />
              <em>Woodshop</em>
            </p>
            <p className="mt-6 max-w-sm t-body">
              Custom furniture, cabinetry and kitchen goods, made by hand in solid hardwood.
            </p>
          </div>

          <nav aria-label="Footer" className="col-span-2 md:col-span-3 lg:col-span-2">
            <p className="t-label mb-5 text-muted">Explore</p>
            <ul className="space-y-1">
              {[...nav, ...secondaryNav].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="link-line text-[0.95rem]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-2 md:col-span-3 lg:col-span-3 lg:col-start-10">
            <p className="t-label mb-5 text-muted">Studio</p>
            <address className="space-y-2 text-[0.95rem] not-italic leading-relaxed">
              <p>{brand.location}</p>
              <a href={`mailto:${brand.email}`} className="link-line text-[0.9rem] [overflow-wrap:anywhere]">
                {brand.email}
              </a>
            </address>
          </div>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-border py-8 text-[0.8125rem] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {brand.name}. Handcrafted in {brand.location}.</p>
          <div className="flex gap-6">
            {legalNav.map((l) => (
              <Link key={l.href} href={l.href} className="link-subtle">
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
