import type { Payment, CreatePaymentPayload } from "@/shared/interface/payment";
import { MOCK_PAYMENTS } from "@/shared/data/mock";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const getPayments = async (): Promise<Payment[]> => {
  await delay(300);
  return MOCK_PAYMENTS;
};

export const createPayment = async (
  payload: CreatePaymentPayload,
): Promise<Payment> => {
  await delay(500);
  const invoice = MOCK_PAYMENTS.find((p) => p.invoiceId === payload.invoiceId);
  return {
    id: `pay-${Date.now()}`,
    paymentNumber: `PAY-2025-${String(MOCK_PAYMENTS.length + 1).padStart(3, "0")}`,
    invoiceId: payload.invoiceId,
    customerId: invoice?.customerId ?? "",
    customer: invoice?.customer ?? { name: "Unknown" },
    invoiceNumber: invoice?.invoiceNumber ?? "",
    amount: payload.amount,
    paymentMethod: payload.paymentMethod,
    paymentDate: payload.paymentDate,
    reference: payload.reference,
    notes: payload.notes,
    status: "completed",
    createdAt: new Date().toISOString().split("T")[0],
  };
};
