import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export const metadata: Metadata = {
  title: {
    default: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    template: '%s | The Haymarket Woodshop',
  },
  description:
    'Premium handmade wooden goods crafted with care in Haymarket. Custom cutting boards, furniture, and cabinetry built to last generations.',
  keywords: ['woodworking', 'handmade', 'cutting boards', 'furniture', 'cabinetry', 'custom woodwork', 'Haymarket'],
  authors: [{ name: 'The Haymarket Woodshop' }],
  creator: 'The Haymarket Woodshop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://haymarketwoodshop.com',
    siteName: 'The Haymarket Woodshop',
    title: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    description:
      'Premium handmade wooden goods crafted with care in Haymarket. Custom cutting boards, furniture, and cabinetry built to last generations.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'The Haymarket Woodshop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Haymarket Woodshop | Handcrafted Fine Woodwork',
    description:
      'Premium handmade wooden goods crafted with care in Haymarket.',
    images: ['/og-image.jpg'],
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
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
