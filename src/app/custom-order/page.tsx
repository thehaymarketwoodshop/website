import type { Metadata } from 'next';
import { CustomOrderForm } from '@/components';
import { PageHero } from '@/components/ui/PageHero';
import { process } from '@/content/site';

export const metadata: Metadata = {
  title: 'Commission',
  description: 'Commission a custom, made-to-order piece from The Haymarket Woodshop — tables, cabinetry, built-ins, furniture and boards.',
  openGraph: {
    title: 'Commission | The Haymarket Woodshop',
    description: 'Commission a custom, made-to-order piece from The Haymarket Woodshop.',
  },
};

export default function CustomOrderPage() {
  return (
    <>
      <PageHero
        label="Commission"
        lines={['A piece that', '*doesn’t exist yet.*']}
        lede="Have something specific in mind? Tell us about it and we’ll build you a quote."
      />
      <section className="pb-[var(--section)]">
        <div className="container-wide grid-12 gap-y-16">
          <ol className="col-span-4 md:col-span-8 lg:col-span-4">
            {process.map((s) => (
              <li key={s.index} className="grid grid-cols-[3.5rem_1fr] gap-3 border-t border-border py-6 last:border-b">
                <span className="font-serif text-2xl italic text-accent">{s.index}</span>
                <div>
                  <h2 className="font-serif text-2xl leading-tight">{s.title}</h2>
                  <p className="mt-2 t-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="col-span-4 md:col-span-8 lg:col-span-7 lg:col-start-6">
            <div className="bg-surface p-[clamp(24px,4vw,56px)]">
              <h2 className="t-h3 mb-8">Request a quote</h2>
              <CustomOrderForm />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
