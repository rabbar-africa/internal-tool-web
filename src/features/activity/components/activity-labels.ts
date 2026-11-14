import moment from "moment";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ActivityChange,
  ActivityEntityType,
  ActivitySource,
  ActivityValue,
  IActivityEntry,
} from "@/shared/interface/activity";

export const ENTITY_LABELS: Record<ActivityEntityType, string> = {
  invoice: "Invoices",
  quotation: "Quotes",
  payment: "Payments",
  credit_note: "Credit notes",
  expense: "Expenses",
  transfer: "Transfers",
  bank_account: "Bank accounts",
  tax: "Taxes",
};

export const SOURCE_LABELS: Record<ActivitySource, string> = {
  WEB: "Web app",
  WHATSAPP: "WhatsApp",
  BACK_OFFICE: "Rabbar support",
  SCHEDULED: "Automatic",
  WEBHOOK: "Automatic",
  IMPORT: "Import",
};

/** Only these are offered as a filter; the API accepts each. */
export const SOURCE_OPTIONS: Array<{ label: string; value: ActivitySource }> = [
  { label: "Web app", value: "WEB" },
  { label: "WhatsApp", value: "WHATSAPP" },
  { label: "Automatic", value: "SCHEDULED" },
  { label: "Import", value: "IMPORT" },
  { label: "Rabbar support", value: "BACK_OFFICE" },
];

/** "Deleted", "Voided"… — the verb, for the badge on each entry. */
export function actionVerb(action: string): string {
  const verb = action.split(".")[1] ?? action;
  const words: Record<string, string> = {
    created: "Created",
    recorded: "Recorded",
    updated: "Edited",
    sent: "Sent",
    marked_paid: "Marked paid",
    voided: "Voided",
    written_off: "Written off",
    write_off_cancelled: "Write-off cancelled",
    deleted: "Deleted",
    balance_carried: "Old balance added",
    balance_uncarried: "Old balance removed",
    recalculated: "Recalculated",
    imported: "Imported",
    converted: "Made into invoice",
    unapplied: "Kept as credit",
    issued: "Issued",
    applied: "Credit applied",
    application_removed: "Credit removed",
    refunded: "Refunded",
    refund_deleted: "Refund deleted",
    primary_changed: "Made primary",
  };
  return words[verb] ?? verb.replace(/_/g, " ");
}

/** Red for what removes or cancels, so it stands out when scanning. */
export function isDestructive(action: string): boolean {
  return /\.(deleted|voided|written_off|refund_deleted)$/.test(action);
}

/** Where a record lives in the app, or null when there is nowhere to go. */
export function entityHref(
  type: ActivityEntityType | "customer" | "job_card",
  id: string | null,
): string | null {
  if (!id) return null;
  switch (type) {
    case "invoice":
      return RouteConstants.invoices.detail.generate({ id });
    case "quotation":
      return RouteConstants.quotations.detail.generate({ id });
    case "payment":
      return RouteConstants.payments.detail.generate({ id });
    case "credit_note":
      return RouteConstants.creditNotes.detail.generate({ id });
    case "expense":
      return RouteConstants.expenses.edit.generate({ id });
    case "transfer":
      return RouteConstants.banking.transfers.path;
    case "bank_account":
      return RouteConstants.settings.accountDetails.path;
    case "tax":
      return RouteConstants.settings.taxes.path;
    case "customer":
      return RouteConstants.customers.detail.generate({ id });
    case "job_card":
      return RouteConstants.jobCards.detail.generate({ id });
  }
}

/** A deleted record has no page to open. */
export function linkFor(entry: IActivityEntry): string | null {
  return entry.action.endsWith(".deleted")
    ? null
    : entityHref(entry.entityType, entry.entityId);
}

const FIELD_LABELS: Record<string, string> = {
  date: "Date",
  dueDate: "Due date",
  status: "Status",
  total: "Total",
  subTotal: "Subtotal",
  discount: "Discount",
  discountPercent: "Discount %",
  taxId: "Tax",
  paymentTerms: "Payment terms",
  paymentTermsLabel: "Payment terms",
  referenceNumber: "Reference",
  notes: "Notes",
  terms: "Terms",
  bankAccountId: "Bank account",
  amount: "Amount",
  mode: "Payment mode",
  paymentMode: "Payment mode",
  depositToAccountId: "Deposited to",
  paidThroughAccountId: "Paid from",
  bankCharges: "Bank charges",
  category: "Category",
  name: "Name",
  vendorName: "Vendor",
  invoiceId: "Invoice",
  jobCardId: "Job card",
  accountName: "Account name",
  bankName: "Bank",
  accountNumber: "Account number",
  isPrimary: "Primary",
  openingBalance: "Opening balance",
  openingBalanceDate: "Opening balance date",
  rate: "Rate",
  percent: "Rate",
  isDefault: "Default",
  isActive: "Active",
};

export const fieldLabel = (field: string) =>
  FIELD_LABELS[field] ??
  field.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ISO = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/;

function formatValue(value: ActivityValue): string {
  if (value === null || value === "") return "none";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "number") return value.toLocaleString("en-NG");
  if (ISO.test(value)) return moment(value).format("DD MMM YYYY");
  // An enum (PARTIALLY_PAID, BANK_TRANSFER) reads as words.
  if (/^[A-Z][A-Z_]+$/.test(value))
    return value.replace(/_/g, " ").toLowerCase();
  return value;
}

/** One line for an edit: "Total: 100 → 150", or "Account number changed". */
export function describeChange(change: ActivityChange): string {
  const label = fieldLabel(change.field);
  if ("changed" in change) return `${label} changed`;
  // An id (an account, a tax) means nothing to read: say it changed.
  if (
    (typeof change.from === "string" && UUID.test(change.from)) ||
    (typeof change.to === "string" && UUID.test(change.to))
  ) {
    return `${label} changed`;
  }
  return `${label}: ${formatValue(change.from)} → ${formatValue(change.to)}`;
}
