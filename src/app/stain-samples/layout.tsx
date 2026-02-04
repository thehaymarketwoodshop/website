import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stain Samples',
  description:
    'Preview how different stains look on walnut, oak, and maple. Explore our stain options to find the perfect finish for your project.',
  openGraph: {
    title: 'Stain Samples | The Haymarket Woodshop',
    description:
      'Preview how different stains look on walnut, oak, and maple. Explore our stain options to find the perfect finish for your project.',
  },
};

export default function StainSamplesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
