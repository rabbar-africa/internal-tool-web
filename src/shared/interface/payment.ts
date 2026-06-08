import type { IBaseFilter } from "./filter";

export type PaymentMethod =
  | "cash"
  | "bank_transfer"
  | "card"
  | "cheque"
  | "pos";

export type PaymentStatus = "completed" | "pending" | "failed";

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  customer: { name: string };
  invoiceNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
  status: PaymentStatus;
  createdAt: string;
}

export interface CreatePaymentPayload {
  paymentNumber: string;
  referenceNumber: string;
  customerId: string;
  customerName: string;
  customer: {
    id: string;
    name: string;
  };
  date: string;
  mode: PaymentModeDto;
  status: PaymentReceivedStatusDto;
  currencyCode: string;
  exchangeRate: number;
  amount: number;
  bankCharges: number;
  depositToAccountId: string;
  depositToName: string;
  notes: string;
  allocations: Array<{
    invoiceId: string;
    amountApplied: number;
  }>;
  amountApplied: number;
  unusedAmount: number;
  // Server-managed — present on responses, omitted when creating.
  id?: string;
  createdAt?: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  cheque: "Cheque",
  pos: "POS",
};

export enum PaymentModeDto {
  CASH = "CASH",
  BANK_TRANSFER = "BANK_TRANSFER",
  CARD = "CARD",
  MOBILE_MONEY = "MOBILE_MONEY",
  CHEQUE = "CHEQUE",
  ONLINE = "ONLINE",
  OTHER = "OTHER",
}

export enum PaymentReceivedStatusDto {
  DRAFT = "DRAFT",
  CONFIRMED = "CONFIRMED",
  REFUNDED = "REFUNDED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}

export interface IGetPaymentsReceivedFilter extends IBaseFilter {
  invoiceId?: string;
  customerId?: string;
  mode?: string;
  status?: string;
}
