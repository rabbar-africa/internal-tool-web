import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryConfigType,
} from "@/lib/react-query";
import { getItems, createItem, getItemById } from "./service";
import type { CreateItemPayload } from "@/shared/interface/item";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { IBaseFilter } from "@/shared/interface/filter";

export const useGetItemsQuery = (
  filter?: IBaseFilter,
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
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.items.getAll],
      }),
    meta: { successMessage: "Item created successfully" },
  });
};
