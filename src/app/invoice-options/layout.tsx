import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Choose Your Option',
  robots: { index: false, follow: false },
};

export default function InvoiceOptionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
