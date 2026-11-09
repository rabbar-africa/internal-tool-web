import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryConfigType,
} from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  CreateRecurringExpensePayload,
  IGetRecurringExpenseFilter,
  IRecurringExpenseDetail,
  UpdateRecurringExpensePayload,
} from "@/shared/interface/recurring-expense";
import {
  changeRecurringExpense,
  createRecurringExpense,
  deleteRecurringExpense,
  getRecurringExpenseById,
  getRecurringExpenseSummary,
  getRecurringExpenses,
  updateRecurringExpense,
  type RecurringAction,
} from "./service";

const keys = customQueryKey.recurringExpenses;

/** The answer is the schedule as it now is: show it without a refetch. */
function useCacheSchedule() {
  const queryClient = useQueryClient();
  return (response: ApiResponse<IRecurringExpenseDetail>) => {
    if (response?.data?.id) {
      queryClient.setQueryData([keys.getById, response.data.id], response);
    }
  };
}

export const useGetRecurringExpensesQuery = (
  filter?: IGetRecurringExpenseFilter,
  config?: QueryConfigType<typeof getRecurringExpenses>,
) =>
  useQuery({
    queryKey: [keys.getAll, filter],
    queryFn: () => getRecurringExpenses(filter),
    ...config,
  });

export const useGetRecurringExpenseSummaryQuery = () =>
  useQuery({
    queryKey: [keys.summary],
    queryFn: getRecurringExpenseSummary,
  });

export const useGetRecurringExpenseByIdQuery = (id: string) =>
  useQuery({
    queryKey: [keys.getById, id],
    queryFn: () => getRecurringExpenseById(id),
    enabled: Boolean(id),
  });

export const useCreateRecurringExpenseMutation = () => {
  const cache = useCacheSchedule();
  return useMutation({
    mutationFn: (payload: CreateRecurringExpensePayload) =>
      createRecurringExpense(payload),
    onSuccess: cache,
    meta: {
      successMessage: "Recurring expense set up",
      // Starting today records the first one at once.
      invalidatesQueryKeys: invalidates.recurringExpenseRecorded,
    },
  });
};

export const useUpdateRecurringExpenseMutation = () => {
  const cache = useCacheSchedule();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateRecurringExpensePayload;
    }) => updateRecurringExpense(id, payload),
    onSuccess: cache,
    meta: {
      successMessage: "Recurring expense updated",
      invalidatesQueryKeys: invalidates.recurringExpense,
    },
  });
};

export const useChangeRecurringExpenseMutation = () => {
  const cache = useCacheSchedule();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: RecurringAction }) =>
      changeRecurringExpense(id, action),
    onSuccess: cache,
    // Resume and Record now can record an expense. The page says what happened.
    meta: { invalidatesQueryKeys: invalidates.recurringExpenseRecorded },
  });
};

export const useDeleteRecurringExpenseMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteRecurringExpense(id),
    meta: {
      successMessage: "Recurring expense deleted",
      // Its expenses stay, but no longer name it.
      invalidatesQueryKeys: invalidates.recurringExpenseRecorded,
    },
  });
