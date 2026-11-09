import type {
  IQuotation,
  QuotationDisplayStatus,
  QuotationStatus,
} from "@/shared/interface/quotation";

export const QUOTATION_STATUS_LABELS: Record<QuotationDisplayStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DECLINED: "Declined",
  EXPIRED: "Expired",
  INVOICED: "Invoiced",
  VOID: "Void",
};

/** Filter values are display statuses: "Sent" leaves out expired quotes. */
export const QUOTATION_STATUS_OPTIONS: {
  label: string;
  value: QuotationDisplayStatus | "";
}[] = [
  { label: "All", value: "" },
  ...(Object.keys(QUOTATION_STATUS_LABELS) as QuotationDisplayStatus[]).map(
    (value) => ({ label: QUOTATION_STATUS_LABELS[value], value }),
  ),
];

/** An invoice that no longer stands, so its quote may be invoiced again. */
const isInvoiceGone = (quote: Pick<IQuotation, "invoice">) =>
  !!quote.invoice &&
  ["DELETED", "VOID"].includes(quote.invoice.status?.toUpperCase());

export interface QuotationActions {
  edit: boolean;
  send: boolean;
  accept: boolean;
  decline: boolean;
  convert: boolean;
  void: boolean;
  delete: boolean;
}

/**
 * What a quote's saved status allows, as the API enforces it (a move it
 * refuses is a 409). Expired is only a label: it never blocks a button,
 * because businesses honour old prices.
 */
export function quotationActions(
  quote: Pick<IQuotation, "status" | "invoice">,
): QuotationActions {
  const status = quote.status?.toUpperCase() as QuotationStatus;
  const reopened = status === "INVOICED" && isInvoiceGone(quote);
  return {
    edit: ["DRAFT", "SENT", "ACCEPTED", "DECLINED"].includes(status),
    send: ["DRAFT", "DECLINED"].includes(status),
    accept: ["DRAFT", "SENT", "DECLINED"].includes(status),
    decline: ["DRAFT", "SENT", "ACCEPTED"].includes(status),
    convert: ["DRAFT", "SENT", "ACCEPTED"].includes(status) || reopened,
    void: ["DRAFT", "SENT", "ACCEPTED", "DECLINED"].includes(status),
    delete: status !== "INVOICED" || reopened,
  };
}
