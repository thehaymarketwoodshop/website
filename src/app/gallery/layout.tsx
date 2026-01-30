import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gallery',
  description:
    'Browse our collection of handcrafted wooden goods including cutting boards, furniture, and cabinetry. Each piece is unique and built to last.',
  openGraph: {
    title: 'Gallery | The Haymarket Woodshop',
    description:
      'Browse our collection of handcrafted wooden goods including cutting boards, furniture, and cabinetry.',
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
