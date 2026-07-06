import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  getCustomers,
  getCustomerById,
  getClientStats,
  createCustomer,
  type CustomerFilter,
  updateCustomer,
  getVehiclesByClient,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type CreateVehiclePayload,
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

export const useGetClientStatsQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.customers.stats, id],
    queryFn: () => getClientStats(id),
    enabled: Boolean(id),
  });

export const useCreateCustomerMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateCustomerPayload) => createCustomer(payload),

    meta: {
      successMessage: "Customer created successfully",
      invalidatesQueryKeys: [[customQueryKey.customers.getAll]],
    },
  });
};

export const useUpdateCustomerMutation = (id: string) => {
  return useMutation({
    mutationFn: (payload: Partial<CreateCustomerPayload>) =>
      updateCustomer(id, payload),

    meta: {
      successMessage: "Customer updated successfully",
      invalidatesQueryKeys: [[customQueryKey.customers.getAll]],
    },
  });
};

// ── Vehicle hooks ─────────────────────────────────────────────────────────────

export const useGetVehiclesByClientQuery = (clientId: string) =>
  useQuery({
    queryKey: [customQueryKey.vehicles.getByClient, clientId],
    queryFn: () => getVehiclesByClient(clientId),
    enabled: Boolean(clientId),
  });

export const useCreateVehicleMutation = (clientId: string) => {
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),

    meta: {
      successMessage: "Vehicle added successfully",
      invalidatesQueryKeys: [[customQueryKey.vehicles.getByClient, clientId]],
    },
  });
};

export const useUpdateVehicleMutation = (id: string, clientId: string) => {
  return useMutation({
    mutationFn: (payload: Partial<Omit<CreateVehiclePayload, "clientId">>) =>
      updateVehicle(id, payload),

    meta: {
      successMessage: "Vehicle updated successfully",
      invalidatesQueryKeys: [[customQueryKey.vehicles.getByClient, clientId]],
    },
  });
};

export const useDeleteVehicleMutation = (clientId: string) => {
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    meta: {
      successMessage: "Vehicle removed",
      invalidatesQueryKeys: [[customQueryKey.vehicles.getByClient, clientId]],
    },
  });
};
