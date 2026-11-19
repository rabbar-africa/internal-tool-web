import { axios } from "@/lib/axios";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  CreateExpenseCategoryPayload,
  DeleteExpenseCategoryResult,
  IExpenseCategory,
  UpdateExpenseCategoryPayload,
} from "@/shared/interface/expense-category";

/** In picker order. `includeHidden` adds the hidden ones (settings). */
export const getExpenseCategories = async (includeHidden = false) => {
  const response = await axios.get<ApiResponse<IExpenseCategory[]>>(
    "/expense-categories",
    { params: includeHidden ? { includeHidden: true } : undefined },
  );
  return response.data;
};

export const createExpenseCategory = async (
  payload: CreateExpenseCategoryPayload,
) => {
  const response = await axios.post<ApiResponse<IExpenseCategory>>(
    "/expense-categories",
    payload,
  );
  return response.data;
};

export const updateExpenseCategory = async (
  id: string,
  payload: UpdateExpenseCategoryPayload,
) => {
  const response = await axios.patch<ApiResponse<IExpenseCategory>>(
    `/expense-categories/${id}`,
    payload,
  );
  return response.data;
};

/** `moveTo`: move what is in it to that category first (a merge). */
export const deleteExpenseCategory = async (id: string, moveTo?: string) => {
  const response = await axios.delete<ApiResponse<DeleteExpenseCategoryResult>>(
    `/expense-categories/${id}`,
    { params: moveTo ? { moveTo } : undefined },
  );
  return response.data;
};
