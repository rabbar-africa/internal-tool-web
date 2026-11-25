/**
 * Which actions an invoice offers in each status (QA 14 Nov 2026, bug #7).
 * Mirrors the API's `invoices/invoice-actions.ts`, which has the last word:
 *
 * - A draft is only looked at, edited or deleted, and issued with *Mark as
 *   sent*. No PDF, payment, write-off or recalculation: it isn't a real
 *   invoice yet. (The API would issue a draft that's paid; we don't offer
 *   it, so nothing leaves the business before it's issued.)
 * - A written-off invoice is closed: no edit or payment until the write-off
 *   is cancelled.
 * - A void invoice is left as it is.
 */
export interface InvoiceActions {
  markSent: boolean;
  edit: boolean;
  recordPayment: boolean;
  writeOff: boolean;
  cancelWriteOff: boolean;
  /** Download, print or send the PDF. */
  pdf: boolean;
  recalculate: boolean;
}

export function invoiceActions(invoice: {
  status?: string | null;
  balance?: number | string | null;
}): InvoiceActions {
  const status = (invoice.status ?? "").toUpperCase();
  const hasBalance = Number(invoice.balance ?? 0) > 0;
  const closed = status === "WRITTEN_OFF" || status === "VOID";
  const isDraft = status === "DRAFT";
  return {
    markSent: isDraft,
    edit: !closed,
    recordPayment: !closed && !isDraft && status !== "PAID" && hasBalance,
    writeOff:
      hasBalance && ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(status),
    cancelWriteOff: status === "WRITTEN_OFF",
    pdf: !isDraft,
    recalculate: !isDraft,
  };
}
