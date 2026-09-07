import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { Analytics } from '@vercel/analytics/react';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehaymarketwoodshop.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    template: '%s | The Haymarket Woodshop',
  },
  description:
    'Premium handmade wooden goods crafted with care in Haymarket. Custom cutting boards, furniture, and cabinetry built to last generations.',
  keywords: ['woodworking', 'handmade', 'cutting boards', 'furniture', 'cabinetry', 'custom woodwork', 'Haymarket'],
  authors: [{ name: 'The Haymarket Woodshop' }],
  creator: 'The Haymarket Woodshop',
  // og:image / twitter:image are generated automatically by src/app/opengraph-image.tsx
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'The Haymarket Woodshop',
    title: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    description:
      'Premium handmade wooden goods crafted with care in Haymarket. Custom cutting boards, furniture, and cabinetry built to last generations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    description:
      'Premium handmade wooden goods crafted with care in Haymarket.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Navbar />
          <CartDrawer />
          <main className="flex-1">{children}</main>
          <Footer />
          <Analytics />
        </CartProvider>
      </body>
    </html>
  );
}
