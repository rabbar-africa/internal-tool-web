import type { Invoice, CreateInvoicePayload } from "@/shared/interface/invoice";
import { MOCK_INVOICES } from "@/shared/data/mock";
import {
  calculateProfit,
  calculateMarginPercent,
  calculateLineTotal,
} from "@/utils/calculations";

const delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

export const getInvoices = async (): Promise<Invoice[]> => {
  await delay(300);
  return MOCK_INVOICES;
};

export const getInvoiceById = async (id: string): Promise<Invoice> => {
  await delay(200);
  const invoice = MOCK_INVOICES.find((i) => i.id === id);
  if (!invoice) throw new Error("Invoice not found");
  return invoice;
};

export const createInvoice = async (
  payload: CreateInvoicePayload,
): Promise<Invoice> => {
  await delay(500);
  const lineItems = payload.lineItems.map((li, idx) => ({
    ...li,
    id: `li-new-${idx}`,
    lineTotal: calculateLineTotal(li.quantity, li.unitPrice, li.taxRate),
  }));
  const subtotal = lineItems.reduce(
    (s, li) => s + li.quantity * li.unitPrice,
    0,
  );
  const taxTotal = lineItems.reduce(
    (s, li) => s + li.quantity * li.unitPrice * (li.taxRate / 100),
    0,
  );
  const totalAmount = subtotal + taxTotal;
  const profit = calculateProfit(totalAmount, 0);
  const marginPercent = calculateMarginPercent(profit, totalAmount);

  return {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2025-${String(MOCK_INVOICES.length + 1).padStart(3, "0")}`,
    customerId: payload.customerId,
    customer: {
      id: payload.customerId,
      name: "New Customer",
      email: "",
      phone: "",
    },
    issueDate: payload.issueDate,
    dueDate: payload.dueDate,
    lineItems,
    subtotal,
    taxTotal,
    totalAmount,
    amountPaid: 0,
    amountDue: totalAmount,
    status: "draft",
    linkedExpenseIds: [],
    totalLinkedExpenses: 0,
    profit,
    marginPercent,
    notes: payload.notes,
    createdAt: new Date().toISOString().split("T")[0],
  };
};
