import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import { getExpenses, createExpense } from "./service";
import type { CreateExpensePayload } from "@/shared/interface/expense";

const KEYS = { all: ["expenses"] as const };

export const useGetExpensesQuery = () =>
  useQuery({ queryKey: KEYS.all, queryFn: getExpenses });

export const useCreateExpenseMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => createExpense(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Expense recorded successfully" },
  });
};
