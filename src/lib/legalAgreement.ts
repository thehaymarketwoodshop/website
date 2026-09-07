// Default terms shown on every new invoice (editable per-invoice in the builder before
// sending — the exact text a customer agreed to is stored verbatim on their signature
// record, so editing this default later never rewrites what past customers already
// signed). Generalized from ~/Downloads/Work Contract.pdf (the Stacey White cabinetry
// job, Oct 2024) — that PDF was a filled-in contract for one specific client and dollar
// amount, so the numbers below reference "the amount(s) shown above" instead of
// hardcoding that job's $2,800 total. Confirm the 50/50 split and 25% non-refundable
// deposit still reflect current policy before relying on this for a real invoice.
export const DEFAULT_LEGAL_AGREEMENT = `
Custom Work Agreement — The Haymarket Woodshop

This agreement is between The Haymarket Woodshop, LLC ("Contractor") and the client named
on this invoice ("Client").

Scope of Work
The Contractor agrees to provide the design, fabrication, and (where applicable) delivery and
installation of the custom work described in the line items above, plus any additional services
mutually agreed upon in writing.

Payment Terms
1. Fifty percent (50%) of the total amount due shown above is payable upfront to initiate the
   project.
2. The remaining fifty percent (50%) is due upon completion and satisfactory delivery or
   installation.
3. Payment is accepted by the methods listed above.

Non-Refundable Deposit
Twenty-five percent (25%) of the total project cost is non-refundable once paid, to cover
administrative, design, and material procurement costs already incurred. The remaining portion
of the upfront payment may be refunded at the Contractor's discretion if cancellation occurs
before work has commenced.

Cancellation Policy
1. If the Client cancels before work has commenced, the Contractor retains the non-refundable
   25% deposit; the remaining upfront payment may be refunded at the Contractor's discretion.
2. If the Client cancels after work has commenced, the Contractor retains the entire upfront
   payment and may seek additional compensation for work completed up to the cancellation date.

Project Timeline
Work begins upon receipt of the upfront payment. The due date shown above is an estimate —
actual completion may vary based on material availability and scope changes.

Governing Law
This agreement is governed by the laws of the Commonwealth of Virginia.

By typing your name and checking the box below, you acknowledge that you have read and
understood this agreement, including the pricing and terms shown on this invoice, and agree to
be bound by its provisions.
`.trim();
