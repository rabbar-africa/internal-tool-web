import type {
  Invoice,
  CreateInvoicePayload,
  IGetInvoiceFilter,
  IInvoiceResponse,
} from "@/shared/interface/invoice";
// import { MOCK_INVOICES } from "@/shared/data/mock";
import { calculateProfit, calculateMarginPercent } from "@/utils/calculations";
import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";

export const getAllInvoices = async (filter?: IGetInvoiceFilter) => {
  const baseUrl = "/invoices";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filter);
  const response = await axios.get<ApiResponse<Array<Invoice>>>(apiUrl);
  return response.data;
};

export const getInvoiceById = async (id: string) => {
  const baseUrl = `/invoices/${id}`;
  const response = await axios.get<ApiResponse<IInvoiceResponse>>(baseUrl);
  return response.data;
};

export const deleteInvoice = async (id: string): Promise<void> => {
  await axios.delete(`/invoices/${id}`);
};

export const downloadInvoicePdf = async (
  id: string,
  invoiceNumber?: string,
): Promise<void> => {
  const response = await axios.get(`/invoices/${id}/pdf`, {
    responseType: "blob",
  });
  const blob = new Blob([response.data], { type: "application/pdf" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${invoiceNumber ?? `invoice-${id}`}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export const createInvoice = async (payload: CreateInvoicePayload) => {
  const lineItems = payload.lineItems.map((li, idx) => {
    const rate =
      typeof li.rate === "string" ? parseFloat(li.rate) || 0 : li.rate;
    const qty = parseFloat(li.quantity) || 0;
    const discountPct = parseFloat((li.discount ?? "0").replace("%", "")) || 0;
    const lineAmount = rate * qty * (1 - discountPct / 100);
    return {
      ...li,
      id: `li-new-${idx}`,
      itemId: li.itemId ?? "",
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
    ...payload,
    id: `inv-${Date.now()}`,
    customerId: payload.customerId,

    issueDate: payload.date,
    dueDate: payload.dueDate,
    lineItems,
    subtotal,
    taxTotal,
    totalAmount,
    amountPaid: 0,
    amountDue: totalAmount,
    linkedExpenseIds: [],
    totalLinkedExpenses: 0,
    profit,
    marginPercent,
    notes: payload.notes,
    createdAt: new Date().toISOString().split("T")[0],
  };
  // console.log("final payload is ", finalPayload);
  const { data } = await axios.post<ApiResponse<IInvoiceResponse>>(
    "/invoices",
    finalPayload,
  );

  return data;
};
