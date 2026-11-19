import { useMemo } from "react";
import { useMutation, useQuery } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";
import type {
  CreateExpenseCategoryPayload,
  IExpenseCategory,
  UpdateExpenseCategoryPayload,
} from "@/shared/interface/expense-category";
import { usePermissions } from "@/hooks/usePermissions";
import {
  createExpenseCategory,
  deleteExpenseCategory,
  getExpenseCategories,
  updateExpenseCategory,
} from "./service";

const EMPTY: IExpenseCategory[] = [];

/**
 * The business's expense categories, in picker order. It rarely changes, so
 * it's kept for half an hour; every change below refreshes it.
 */
export const useExpenseCategories = ({
  includeHidden = false,
  enabled = true,
}: { includeHidden?: boolean; enabled?: boolean } = {}) => {
  // Reading the list needs `read expenses`; anyone else would only get a 403.
  const { canRead } = usePermissions();
  const query = useQuery({
    queryKey: [customQueryKey.expenseCategories.getAll, { includeHidden }],
    queryFn: () => getExpenseCategories(includeHidden),
    staleTime: 30 * 60_000,
    enabled: enabled && canRead("expenses"),
  });
  const categories: IExpenseCategory[] = query.data?.data ?? EMPTY;
  const byId = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );
  return { ...query, categories, byId };
};

export const useCreateExpenseCategoryMutation = () =>
  useMutation({
    mutationFn: (payload: CreateExpenseCategoryPayload) =>
      createExpenseCategory(payload),
    meta: {
      successMessage: "Category added",
      invalidatesQueryKeys: invalidates.expenseCategory,
    },
  });

export const useUpdateExpenseCategoryMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateExpenseCategoryPayload;
    }) => updateExpenseCategory(id, payload),
    meta: {
      successMessage: "Category updated",
      invalidatesQueryKeys: invalidates.expenseCategory,
    },
  });

export const useDeleteExpenseCategoryMutation = () =>
  useMutation({
    mutationFn: ({ id, moveTo }: { id: string; moveTo?: string }) =>
      deleteExpenseCategory(id, moveTo),
    meta: {
      successMessage: "Category deleted",
      invalidatesQueryKeys: invalidates.expenseCategory,
    },
  });
