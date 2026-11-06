import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createExpense,
  createExpensesBulk,
  deleteExpense,
  getInvoiceCosts,
  recordInvoiceCosts,
  regroupInvoiceCosts,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "./service";
import type {
  CreateExpensePayload,
  IGetExpenseFilter,
  RecordInvoiceCostsPayload,
  RegroupInvoiceCostsPayload,
  UpdateExpensePayload,
} from "@/shared/interface/expense";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";

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
      invalidatesQueryKeys: invalidates.expenseCreated,
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
      invalidatesQueryKeys: invalidates.expense,
    },
  });

export const useDeleteExpenseMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    meta: {
      successMessage: "Expense deleted",
      invalidatesQueryKeys: invalidates.expense,
    },
  });

export const useCreateExpensesBulkMutation = () =>
  useMutation({
    mutationFn: (expenses: CreateExpensePayload[]) =>
      createExpensesBulk(expenses),
    meta: {
      successMessage: "Expenses recorded",
      invalidatesQueryKeys: invalidates.expenseCreated,
    },
  });

export const useGetInvoiceCostsQuery = (
  invoiceId: string,
  config?: QueryConfigType<typeof getInvoiceCosts>,
) =>
  useQuery({
    queryKey: [customQueryKey.expenses.invoiceCosts, invoiceId],
    queryFn: () => getInvoiceCosts(invoiceId),
    enabled: Boolean(invoiceId),
    ...config,
  });

export const useRecordInvoiceCostsMutation = () =>
  useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: RecordInvoiceCostsPayload;
    }) => recordInvoiceCosts(invoiceId, payload),
    meta: {
      successMessage: "Costs recorded",
      invalidatesQueryKeys: invalidates.expenseCreated,
    },
  });

export const useRegroupInvoiceCostsMutation = () =>
  useMutation({
    mutationFn: ({
      invoiceId,
      payload,
    }: {
      invoiceId: string;
      payload: RegroupInvoiceCostsPayload;
    }) => regroupInvoiceCosts(invoiceId, payload),
    meta: {
      successMessage: "Items updated",
      invalidatesQueryKeys: invalidates.expense,
    },
  });
