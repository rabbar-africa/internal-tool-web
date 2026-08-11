import { useMutation, useQuery, type QueryConfigType } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type {
  ChecklistFilter,
  CreateChecklistItemPayload,
} from "@/shared/interface/inspection";
import {
  createChecklistItem,
  deleteChecklistItem,
  getChecklistCategories,
  getChecklistItems,
  getGroupedChecklistItems,
  seedDefaultChecklistItems,
  updateChecklistItem,
} from "./checklists.service";

const CATALOG_KEYS = [
  [customQueryKey.checklists.getAll],
  [customQueryKey.checklists.grouped],
  [customQueryKey.checklists.categories],
];

export const useGetChecklistItemsQuery = (
  filters: ChecklistFilter = {},
  config?: QueryConfigType<typeof getChecklistItems>,
) =>
  useQuery({
    queryKey: [customQueryKey.checklists.getAll, filters],
    queryFn: () => getChecklistItems(filters),
    ...config,
  });

export const useGetGroupedChecklistItemsQuery = (
  config?: QueryConfigType<typeof getGroupedChecklistItems>,
) =>
  useQuery({
    queryKey: [customQueryKey.checklists.grouped],
    queryFn: getGroupedChecklistItems,
    ...config,
  });

export const useGetChecklistCategoriesQuery = (
  config?: QueryConfigType<typeof getChecklistCategories>,
) =>
  useQuery({
    queryKey: [customQueryKey.checklists.categories],
    queryFn: getChecklistCategories,
    ...config,
  });

export const useCreateChecklistItemMutation = () =>
  useMutation({
    mutationFn: (data: CreateChecklistItemPayload) => createChecklistItem(data),
    meta: {
      successMessage: "Checklist item added",
      invalidatesQueryKeys: CATALOG_KEYS,
    },
  });

export const useUpdateChecklistItemMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CreateChecklistItemPayload>;
    }) => updateChecklistItem(id, data),
    meta: {
      successMessage: "Checklist item updated",
      invalidatesQueryKeys: CATALOG_KEYS,
    },
  });

export const useDeleteChecklistItemMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteChecklistItem(id),
    meta: {
      successMessage: "Checklist item removed",
      invalidatesQueryKeys: CATALOG_KEYS,
    },
  });

export const useSeedDefaultChecklistMutation = () =>
  useMutation({
    mutationFn: seedDefaultChecklistItems,
    meta: {
      successMessage: "Standard checklist added",
      invalidatesQueryKeys: CATALOG_KEYS,
    },
  });
