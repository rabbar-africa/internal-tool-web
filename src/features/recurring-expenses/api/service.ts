import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  CreateRecurringExpensePayload,
  IGetRecurringExpenseFilter,
  IRecurringExpense,
  IRecurringExpenseDetail,
  RecurringExpenseSummary,
  UpdateRecurringExpensePayload,
} from "@/shared/interface/recurring-expense";

const BASE = "/recurring-expenses";

export const getRecurringExpenses = async (
  filter?: IGetRecurringExpenseFilter,
) => {
  const { data } = await axios.get<ApiResponse<IRecurringExpense[]>>(
    buildUrlWithQueryParams(BASE, filter),
  );
  return data;
};

export const getRecurringExpenseSummary = async () => {
  const { data } = await axios.get<ApiResponse<RecurringExpenseSummary>>(
    `${BASE}/summary`,
  );
  return data;
};

export const getRecurringExpenseById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<IRecurringExpenseDetail>>(
    `${BASE}/${id}`,
  );
  return data;
};

export const createRecurringExpense = async (
  payload: CreateRecurringExpensePayload,
) => {
  const { data } = await axios.post<ApiResponse<IRecurringExpenseDetail>>(
    BASE,
    payload,
  );
  return data;
};

export const updateRecurringExpense = async (
  id: string,
  payload: UpdateRecurringExpensePayload,
) => {
  const { data } = await axios.put<ApiResponse<IRecurringExpenseDetail>>(
    `${BASE}/${id}`,
    payload,
  );
  return data;
};

export type RecurringAction = "pause" | "resume" | "stop" | "run-now";

/** Each answers with the schedule as it now is. */
export const changeRecurringExpense = async (
  id: string,
  action: RecurringAction,
) => {
  const url = `${BASE}/${id}/${action}`;
  const { data } =
    action === "run-now"
      ? await axios.post<ApiResponse<IRecurringExpenseDetail>>(url)
      : await axios.patch<ApiResponse<IRecurringExpenseDetail>>(url);
  return data;
};

export const deleteRecurringExpense = async (id: string) => {
  await axios.delete(`${BASE}/${id}`);
};
