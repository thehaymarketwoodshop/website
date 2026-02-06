import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Products',
  description:
    'Browse our collection of handcrafted wooden goods including cutting boards, furniture, and cabinetry. Each piece is unique and built to last.',
  openGraph: {
    title: 'Products | The Haymarket Woodshop',
    description:
      'Browse our collection of handcrafted wooden goods including cutting boards, furniture, and cabinetry.',
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
