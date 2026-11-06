import type { ExportScope } from "@/shared/interface/export";

/**
 * One customer's records. Expenses aren't included: the backend can't yet
 * filter them by customer.
 */
export const customerExportScope = (
  customerId: string,
  customerName: string,
): ExportScope => ({
  label: customerName,
  filters: {
    invoices: { customerId },
    payments_received: { customerId },
    job_cards: { clientId: customerId },
    vehicles: { clientId: customerId },
  },
});

/**
 * One job card's records. Payments aren't included: the backend can't yet
 * filter them by job card.
 */
export const jobCardExportScope = (
  jobCardId: string,
  jobNumber: string,
): ExportScope => ({
  label: jobNumber,
  filters: {
    invoices: { jobCardId },
    expenses: { jobCardId },
  },
});
