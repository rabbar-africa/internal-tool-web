/**
 * Which actions an invoice offers in each status (QA 14 Nov 2026, bug #7).
 * Mirrors the API's `invoices/invoice-actions.ts`, which has the last word:
 *
 * - A draft is issued with *Mark as sent*, or by recording a payment (which
 *   issues it, as in Zoho). It cannot be written off: nothing is owed yet.
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
}

export function invoiceActions(invoice: {
  status?: string | null;
  balance?: number | string | null;
}): InvoiceActions {
  const status = (invoice.status ?? "").toUpperCase();
  const hasBalance = Number(invoice.balance ?? 0) > 0;
  const closed = status === "WRITTEN_OFF" || status === "VOID";
  return {
    markSent: status === "DRAFT",
    edit: !closed,
    recordPayment: !closed && status !== "PAID" && hasBalance,
    writeOff:
      hasBalance && ["SENT", "PARTIALLY_PAID", "OVERDUE"].includes(status),
    cancelWriteOff: status === "WRITTEN_OFF",
  };
}
