import type { DiscountType, InvoiceItemInput } from '@/types/invoice';

export interface InvoiceTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  totalCents: number;
}

// Single source of truth for invoice arithmetic — used by the admin builder for live
// preview AND recomputed server-side before persisting/charging, so the customer is
// never charged a total that only ever existed in client-side state.
export function computeInvoiceTotals(
  items: InvoiceItemInput[],
  taxRate: number,
  shippingDollars: number,
  discountType: DiscountType,
  discountValue: number
): InvoiceTotals {
  const subtotalCents = Math.round(
    items.reduce((sum, it) => sum + (Number(it.qty) || 0) * (Number(it.rate) || 0) * 100, 0)
  );

  const rawDiscountCents =
    discountType === 'percent'
      ? Math.round(subtotalCents * ((Number(discountValue) || 0) / 100))
      : Math.round((Number(discountValue) || 0) * 100);
  const discountCents = Math.min(Math.max(rawDiscountCents, 0), subtotalCents);

  const afterDiscountCents = subtotalCents - discountCents;
  const taxCents = Math.round(afterDiscountCents * ((Number(taxRate) || 0) / 100));
  const shippingCents = Math.round((Number(shippingDollars) || 0) * 100);
  const totalCents = afterDiscountCents + taxCents + shippingCents;

  return { subtotalCents, discountCents, taxCents, shippingCents, totalCents };
}

export function centsToDollars(cents: number): number {
  return Math.round(cents) / 100;
}

export function fmtCents(cents: number): string {
  return (cents / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
}

export function randomInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const rand = Math.floor(10000 + Math.random() * 90000);
  return `INV-${year}-${rand}`;
}
