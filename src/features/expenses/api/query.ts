import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createExpense,
  deleteExpense,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "./service";
import type {
  CreateExpensePayload,
  IGetExpenseFilter,
  UpdateExpensePayload,
} from "@/shared/interface/expense";
import { customQueryKey } from "@/shared/constants/query-keys";

// Expenses roll up into job card P&L, so mutations refresh those too.
const expenseInvalidations = [
  [customQueryKey.expenses.getAll],
  [customQueryKey.jobCards.getById],
  [customQueryKey.jobCards.financials],
];

export const useGetExpensesQuery = (
  filter?: IGetExpenseFilter,
  config?: QueryConfigType<typeof getExpenses>,
) =>
  useQuery({
    queryKey: [customQueryKey.expenses.getAll, filter],
    queryFn: () => getExpenses(filter),
    ...config,
  });

export const useGetExpenseByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.expenses.getById, id],
    queryFn: () => getExpenseById(id),
    enabled: Boolean(id),
  });

export const useCreateExpenseMutation = () =>
  useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    meta: {
      successMessage: "Expense recorded successfully",
      invalidatesQueryKeys: expenseInvalidations,
    },
  });

export const useUpdateExpenseMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpensePayload;
    }) => updateExpense(id, payload),
    meta: {
      successMessage: "Expense updated successfully",
      invalidatesQueryKeys: [
        ...expenseInvalidations,
        [customQueryKey.expenses.getById],
      ],
    },
  });

export const useDeleteExpenseMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    meta: {
      successMessage: "Expense deleted",
      invalidatesQueryKeys: expenseInvalidations,
    },
  });
