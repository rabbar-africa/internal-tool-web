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
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate: string;
  reference?: string;
  notes?: string;
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Cash",
  bank_transfer: "Bank Transfer",
  card: "Card",
  cheque: "Cheque",
  pos: "POS",
};
