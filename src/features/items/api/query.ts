import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import { getItems, createItem } from "./service";
import type { CreateItemPayload } from "@/shared/interface/item";

const KEYS = { all: ["items"] as const };

export const useGetItemsQuery = () =>
  useQuery({ queryKey: KEYS.all, queryFn: getItems });

export const useCreateItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateItemPayload) => createItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Item created successfully" },
  });
};
