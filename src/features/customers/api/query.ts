import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  getCustomers,
  getCustomerById,
  getClientStats,
  createCustomer,
  type CustomerFilter,
  updateCustomer,
  getVehiclesByClient,
  getCustomerStatement,
  downloadCustomerStatementPdf,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  type CreateVehiclePayload,
} from "./service";
import type {
  CreateCustomerPayload,
  CustomerStatementParams,
} from "@/shared/interface/customer";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";

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
      invalidatesQueryKeys: invalidates.customerCreated,
    },
  });
};

export const useUpdateCustomerMutation = (id: string) => {
  return useMutation({
    mutationFn: (payload: Partial<CreateCustomerPayload>) =>
      updateCustomer(id, payload),

    meta: {
      successMessage: "Customer updated successfully",
      invalidatesQueryKeys: invalidates.customer,
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

export const useCreateVehicleMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateVehiclePayload) => createVehicle(payload),

    meta: {
      successMessage: "Vehicle added successfully",
      invalidatesQueryKeys: invalidates.vehicle,
    },
  });
};

export const useUpdateVehicleMutation = (id: string) => {
  return useMutation({
    mutationFn: (payload: Partial<Omit<CreateVehiclePayload, "clientId">>) =>
      updateVehicle(id, payload),

    meta: {
      successMessage: "Vehicle updated successfully",
      invalidatesQueryKeys: invalidates.vehicle,
    },
  });
};

export const useDeleteVehicleMutation = () => {
  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id),
    meta: {
      successMessage: "Vehicle removed",
      invalidatesQueryKeys: invalidates.vehicle,
    },
  });
};

export const useGetCustomerStatementQuery = (
  clientId: string,
  params: CustomerStatementParams,
  options?: { enabled?: boolean },
) =>
  useQuery({
    queryKey: [customQueryKey.customers.statement, clientId, params],
    queryFn: () => getCustomerStatement(clientId, params),
    enabled: Boolean(clientId) && (options?.enabled ?? true),
    // What's about to be sent to a client shouldn't be minutes old.
    staleTime: 0,
  });

export const useDownloadCustomerStatementMutation = () =>
  useMutation({
    mutationFn: ({
      clientId,
      params,
    }: {
      clientId: string;
      params: CustomerStatementParams;
    }) => downloadCustomerStatementPdf(clientId, params),
  });
