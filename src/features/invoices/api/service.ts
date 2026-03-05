import type { Invoice, CreateInvoicePayload } from "@/shared/interface/invoice";
import { MOCK_INVOICES } from "@/shared/data/mock";
import { calculateProfit, calculateMarginPercent } from "@/utils/calculations";

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

  const lineItems = payload.line_items.map((li, idx) => {
    const rate =
      typeof li.rate === "string" ? parseFloat(li.rate) || 0 : li.rate;
    const qty = parseFloat(li.quantity) || 0;
    const discountPct = parseFloat((li.discount ?? "0").replace("%", "")) || 0;
    const lineAmount = rate * qty * (1 - discountPct / 100);
    return {
      id: `li-new-${idx}`,
      itemId: li.item_id ?? "",
      description: li.description,
      quantity: qty,
      unitPrice: rate,
      taxRate: 0,
      lineTotal: lineAmount,
    };
  });

  const subtotal = lineItems.reduce(
    (s, li) => s + li.quantity * li.unitPrice,
    0,
  );
  const taxTotal = 0;
  const entityDiscount = parseFloat(payload.discount) || 0;
  const adjustment = parseFloat(payload.adjustment) || 0;
  const totalAmount = subtotal - entityDiscount + adjustment + taxTotal;

  const profit = calculateProfit(totalAmount, 0);
  const marginPercent = calculateMarginPercent(profit, totalAmount);

  const finalPayload = {
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-${String(MOCK_INVOICES.length + 1).padStart(3, "0")}`,
    customerId: payload.customer_id,
    customer: {
      id: payload.customer_id,
      name: "New Customer",
      email: "",
      phone: "",
    },
    issueDate: payload.date,
    dueDate: payload.due_date,
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

  // console.log("final payload is ", finalPayload);
  return new Promise<Invoice>((resolve) => {
    resolve(finalPayload as any);
  });
};
