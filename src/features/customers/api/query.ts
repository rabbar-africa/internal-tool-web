import {
  useQuery,
  useMutation,
  useQueryClient,
  type QueryConfigType,
} from "@/lib/react-query";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  type CustomerFilter,
} from "./service";
import type { CreateCustomerPayload } from "@/shared/interface/customer";
import { customQueryKey } from "@/shared/constants/query-keys";

export const useGetAllCustomersQuery = (
  filter?: CustomerFilter,
  config?: QueryConfigType<typeof getCustomers>,
) => {
  return useQuery({
    queryKey: [customQueryKey.customers.getAll, filter],
    queryFn: () => getCustomers(filter),
    ...config,
  });
};

export const useGetCustomerByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.customers.getById, id],
    queryFn: () => getCustomerById(id),
    enabled: Boolean(id),
  });

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: [customQueryKey.customers.getAll],
      }),
    meta: { successMessage: "Customer created successfully" },
  });
};
