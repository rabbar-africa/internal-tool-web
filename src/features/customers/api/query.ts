import { useQuery, useMutation, useQueryClient } from "@/lib/react-query";
import { getCustomers, getCustomerById, createCustomer } from "./service";
import type { CreateCustomerPayload } from "@/shared/interface/customer";

const KEYS = {
  all: ["customers"] as const,
  detail: (id: string) => ["customers", id] as const,
};

export const useGetCustomersQuery = () =>
  useQuery({ queryKey: KEYS.all, queryFn: getCustomers });

export const useGetCustomerByIdQuery = (id: string) =>
  useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
  });

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: KEYS.all }),
    meta: { successMessage: "Customer created successfully" },
  });
};
