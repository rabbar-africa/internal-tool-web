import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createExpense,
  createExpensesBulk,
  deleteExpense,
  getInvoiceCosts,
  recordInvoiceCosts,
  getExpenseById,
  getExpenses,
  updateExpense,
} from "./service";
import type {
  CreateExpensePayload,
  IGetExpenseFilter,
  RecordInvoiceCostsPayload,
  UpdateExpensePayload,
} from "@/shared/interface/expense";
import { customQueryKey } from "@/shared/constants/query-keys";

// Expenses roll up into job card P&L, invoice margins and account
// statements, so mutations refresh those too.
const expenseInvalidations = [
  [customQueryKey.expenses.getAll],
  [customQueryKey.expenses.invoiceCosts],
  [customQueryKey.jobCards.getById],
  [customQueryKey.jobCards.financials],
  [customQueryKey.accountStatements.get],
  [customQueryKey.accountStatements.business],
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

export const useCreateExpensesBulkMutation = () =>
  useMutation({
    mutationFn: (expenses: CreateExpensePayload[]) =>
      createExpensesBulk(expenses),
    meta: {
      successMessage: "Expenses recorded",
      invalidatesQueryKeys: expenseInvalidations,
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
      invalidatesQueryKeys: expenseInvalidations,
    },
  });
