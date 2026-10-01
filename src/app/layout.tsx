import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import 'lenis/dist/lenis.css';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CartProvider } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { SmoothScroll } from '@/components/motion/SmoothScroll';
import { Analytics } from '@vercel/analytics/react';

const serif = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  style: ['normal', 'italic'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Jost({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-sans',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://thehaymarketwoodshop.com';
const description =
  'Custom furniture, cabinetry, built-ins and cutting boards, made by hand in solid hardwood in Haymarket, Virginia.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Haymarket Woodshop — Custom furniture & cabinetry, made by hand',
    template: '%s | The Haymarket Woodshop',
  },
  description,
  keywords: ['custom furniture', 'cabinetry', 'built-ins', 'dining tables', 'cutting boards', 'woodworking', 'Haymarket, Virginia'],
  authors: [{ name: 'The Haymarket Woodshop' }],
  creator: 'The Haymarket Woodshop',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'The Haymarket Woodshop',
    title: 'The Haymarket Woodshop',
    description,
  },
  twitter: { card: 'summary_large_image', title: 'The Haymarket Woodshop', description },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#1B1613',
};

// Flags motion-capable browsers before first paint so reveal states never flash.
const motionFlag = `try{if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('js-motion')}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionFlag }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-background focus:px-4 focus:py-3"
        >
          Skip to content
        </a>
        <CartProvider>
          <SmoothScroll>
            <Navbar />
            <main id="main">{children}</main>
            <Footer />
            <CartDrawer />
          </SmoothScroll>
        </CartProvider>
        <Analytics />
      </body>
    </html>
  );
}
