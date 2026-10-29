import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse, type IMeta } from "@/shared/interface/api";
import type {
  CreateExpensePayload,
  Expense,
  IGetExpenseFilter,
  InvoiceCosts,
  RecordInvoiceCostsPayload,
  RecordInvoiceCostsResponse,
  UpdateExpensePayload,
} from "@/shared/interface/expense";

/** Expense list meta carries an extra running total of the filtered rows. */
export type ExpenseListResponse = Omit<ApiResponse<Expense[]>, "meta"> & {
  meta: IMeta & { totalAmount?: number };
};

export const getExpenses = async (filter?: IGetExpenseFilter) => {
  const apiUrl = buildUrlWithQueryParams("/expenses", filter);
  const response = await axios.get<ExpenseListResponse>(apiUrl);
  return response.data;
};

export const getExpenseById = async (id: string) => {
  const response = await axios.get<ApiResponse<Expense>>(`/expenses/${id}`);
  return response.data;
};

export const createExpense = async (payload: CreateExpensePayload) => {
  const response = await axios.post<ApiResponse<Expense>>("/expenses", payload);
  return response.data;
};

export const updateExpense = async (
  id: string,
  payload: UpdateExpensePayload,
) => {
  const response = await axios.put<ApiResponse<Expense>>(
    `/expenses/${id}`,
    payload,
  );
  return response.data;
};

export const deleteExpense = async (id: string): Promise<void> => {
  await axios.delete(`/expenses/${id}`);
};

/**
 * Up to 100 expenses saved together — all of them or none. An error names the
 * entry it is about: "expenses[2]: …".
 */
export const createExpensesBulk = async (expenses: CreateExpensePayload[]) => {
  const response = await axios.post<ApiResponse<Expense[]>>("/expenses/bulk", {
    expenses,
  });
  return response.data;
};

/** What the invoice billed against what was spent, line by line. */
export const getInvoiceCosts = async (invoiceId: string) => {
  const response = await axios.get<ApiResponse<InvoiceCosts>>(
    `/invoices/${invoiceId}/expenses`,
  );
  return response.data;
};

/** Adds costs to an invoice (never replaces earlier ones). */
export const recordInvoiceCosts = async (
  invoiceId: string,
  payload: RecordInvoiceCostsPayload,
) => {
  const response = await axios.post<ApiResponse<RecordInvoiceCostsResponse>>(
    `/invoices/${invoiceId}/expenses`,
    payload,
  );
  return response.data;
};
