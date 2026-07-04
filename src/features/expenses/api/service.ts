import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import { type ApiResponse, type IMeta } from "@/shared/interface/api";
import type {
  CreateExpensePayload,
  Expense,
  IGetExpenseFilter,
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
