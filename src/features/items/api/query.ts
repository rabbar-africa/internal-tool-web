import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  getItems,
  createItem,
  getItemById,
  updateItem,
  type ItemFilter,
} from "./service";
import type { CreateItemPayload } from "@/shared/interface/item";
import { customQueryKey } from "@/shared/constants/query-keys";

export const useGetItemsQuery = (
  filter?: ItemFilter,
  config?: QueryConfigType<typeof getItems>,
) => {
  return useQuery({
    queryKey: [customQueryKey.items.getAll, filter],
    queryFn: () => getItems(filter),
    ...config,
  });
};

export const useGetItemByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.items.getById, id],
    queryFn: () => getItemById(id),
    enabled: Boolean(id),
  });

export const useCreateItemMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    meta: {
      successMessage: "Item created successfully",
      invalidatesQuery: [customQueryKey.items.getAll],
    },
  });
};

export const useUpdateItemMutation = (id: string) => {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) => updateItem(id, payload),
    meta: {
      successMessage: "Item updated successfully",
      invalidatesQuery: [customQueryKey.items.getAll],
    },
  });
};
