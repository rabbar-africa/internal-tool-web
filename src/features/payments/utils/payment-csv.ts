import type { IPaymentReceived } from "@/shared/interface/payment";
import { formatAccountLabel } from "@/features/settings/components/account-details/AccountSelect";

export const MODE_LABELS: Record<string, string> = {
  CASH: "Cash",
  BANK_TRANSFER: "Bank Transfer",
  CARD: "Card",
  MOBILE_MONEY: "Mobile Money",
  CHEQUE: "Cheque",
  ONLINE: "Online",
  OTHER: "Other",
};

export const invoiceNumbersOf = (payment: IPaymentReceived): string[] =>
  (payment.allocations ?? [])
    .map((a) => a.invoice?.invoiceNumber)
    .filter(Boolean) as string[];

// exportToCSV writes columns in the order of each row's keys.
export const PAYMENT_CSV_HEADERS = {
  paymentNumber: "Payment #",
  invoiceNumbers: "Invoice #",
  referenceNumber: "Reference #",
  customerName: "Customer",
  mode: "Mode",
  depositTo: "Paid Into",
  amount: "Amount",
  amountApplied: "Applied",
  unusedAmount: "Unused",
  date: "Date",
  status: "Status",
} as const;

export const paymentToCsvRow = (p: IPaymentReceived) => ({
  paymentNumber: p.paymentNumber,
  invoiceNumbers: invoiceNumbersOf(p).join(", "),
  referenceNumber: p.referenceNumber,
  customerName: p.customerName || p.client?.displayName || "",
  mode: MODE_LABELS[p.mode] ?? p.mode,
  depositTo: p.depositToAccount ? formatAccountLabel(p.depositToAccount) : "",
  amount: p.amount,
  amountApplied: p.amountApplied,
  unusedAmount: p.unusedAmount,
  date: p.date,
  status: p.status,
});
