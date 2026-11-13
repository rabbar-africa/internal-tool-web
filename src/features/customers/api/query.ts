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
  deleteCustomer,
  getCustomerEraseImpact,
  eraseCustomer,
  getCustomerDeleteImpact,
  getCustomerMergePreview,
  mergeCustomer,
} from "./service";
import type {
  CreateCustomerPayload,
  CustomerStatementParams,
  EraseCustomerPayload,
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

// Their invoices, job cards, payments and vehicles lose the link (and, when
// erased, their details), so everything showing them refreshes.
const REMOVED_CUSTOMER_INVALIDATIONS = [
  ...invalidates.customer,
  ...invalidates.vehicle,
  [customQueryKey.paperwork.getAll],
  [customQueryKey.reminders.getAll],
  [customQueryKey.reminders.upcoming],
  [customQueryKey.analytics.dashboard],
];

export const useGetCustomerDeleteImpactQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.customers.deleteImpact, id],
    queryFn: () => getCustomerDeleteImpact(id),
    enabled: Boolean(id),
    // An invoice may have been made since this was last opened.
    staleTime: 0,
    gcTime: 0,
  });

export const useDeleteCustomerMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      deleteVehicles,
    }: {
      id: string;
      deleteVehicles?: boolean;
    }) => deleteCustomer(id, { deleteVehicles }),
    meta: {
      successMessage: "Customer deleted",
      invalidatesQueryKeys: REMOVED_CUSTOMER_INVALIDATIONS,
    },
  });

export const useGetCustomerMergePreviewQuery = (id: string, intoId: string) =>
  useQuery({
    queryKey: [customQueryKey.customers.mergePreview, id, intoId],
    queryFn: () => getCustomerMergePreview(id, intoId),
    enabled: Boolean(id) && Boolean(intoId),
    staleTime: 0,
    gcTime: 0,
  });

export const useMergeCustomerMutation = () =>
  useMutation({
    mutationFn: ({ id, intoId }: { id: string; intoId: string }) =>
      mergeCustomer(id, intoId),
    meta: {
      successMessage: "Customers merged",
      invalidatesQueryKeys: invalidates.customerMerged,
    },
  });

export const useGetCustomerEraseImpactQuery = (id: string, enabled = true) =>
  useQuery({
    queryKey: [customQueryKey.customers.eraseImpact, id],
    queryFn: () => getCustomerEraseImpact(id),
    enabled: Boolean(id) && enabled,
    // What's about to be erased must be what's there now.
    staleTime: 0,
    gcTime: 0,
  });

export const useEraseCustomerMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: EraseCustomerPayload;
    }) => eraseCustomer(id, payload),
    meta: { invalidatesQueryKeys: REMOVED_CUSTOMER_INVALIDATIONS },
  });
