import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createOrganizationAddress,
  createOrganizationBankAccount,
  createOrganizationCurrency,
  createOrganizationTax,
  deleteOrganizationAddress,
  deleteOrganizationBankAccount,
  deleteOrganizationCurrency,
  deleteOrganizationTax,
  getOrganizationAddresses,
  getOrganizationBankAccounts,
  getOrganizationCurrencies,
  getOrganizationDetails,
  getOrganizationTaxes,
  getOrganizationTransactionSeries,
  setDefaultOrganizationCurrency,
  setPrimaryOrganizationAddress,
  setPrimaryOrganizationBankAccount,
  updateOrganizationAddress,
  updateOrganizationBankAccount,
  updateOrganizationCurrency,
  updateOrganizationConfig,
  updateOrganizationDetails,
  updateOrganizationTax,
  updateOrganizationTransactionSeries,
  uploadOrganizationLogo,
} from "./service";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { QueryConfigType } from "@/lib/react-query";
import type {
  CreateOrgAddressPayload,
  CreateOrgBankAccountPayload,
  CreateOrgCurrencyPayload,
  CreateOrgTaxPayload,
  TxnSeriesModule,
  UpdateOrgConfigPayload,
  UpsertOrgTransactionSeriesPayload,
} from "@/shared/interface/settings";

const orgKeys = customQueryKey.organizations;

// ─── Organization details ────────────────────────────────────────────────────

export const useGetOrganizationDetails = (
  config?: QueryConfigType<typeof getOrganizationDetails>,
) => {
  return useQuery({
    queryKey: [orgKeys.details],
    queryFn: getOrganizationDetails,
    ...config,
  });
};

export const useUpdateOrganizationDetails = () => {
  return useMutation({
    mutationKey: [orgKeys.details],
    mutationFn: updateOrganizationDetails,
    meta: {
      successMessage: "Organization details updated successfully",
      invalidatesQueryKeys: [[orgKeys.details]],
    },
  });
};

export const useUploadOrganizationLogo = () => {
  return useMutation({
    mutationFn: uploadOrganizationLogo,
    meta: {
      successMessage: "Logo updated successfully",
      invalidatesQueryKeys: [[orgKeys.details]],
    },
  });
};

// ─── General configuration ─────────────────────────────────────────────────

export const useUpdateOrganizationConfig = () => {
  return useMutation({
    mutationFn: (payload: Partial<UpdateOrgConfigPayload>) =>
      updateOrganizationConfig(payload),
    meta: {
      successMessage: "Configuration updated successfully",
      invalidatesQueryKeys: [[orgKeys.details]],
    },
  });
};

// ─── Addresses ───────────────────────────────────────────────────────────────

export const useGetOrganizationAddresses = (
  config?: QueryConfigType<typeof getOrganizationAddresses>,
) => {
  return useQuery({
    queryKey: [orgKeys.addresses],
    queryFn: getOrganizationAddresses,
    ...config,
  });
};

export const useCreateOrganizationAddress = () => {
  return useMutation({
    mutationFn: (payload: CreateOrgAddressPayload) =>
      createOrganizationAddress(payload),
    meta: {
      successMessage: "Address added successfully",
      invalidatesQueryKeys: [[orgKeys.addresses]],
    },
  });
};

export const useUpdateOrganizationAddress = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateOrgAddressPayload & { isActive: boolean }>;
    }) => updateOrganizationAddress(id, payload),
    meta: {
      successMessage: "Address updated successfully",
      invalidatesQueryKeys: [[orgKeys.addresses]],
    },
  });
};

export const useDeleteOrganizationAddress = () => {
  return useMutation({
    mutationFn: (id: string) => deleteOrganizationAddress(id),
    meta: {
      successMessage: "Address removed",
      invalidatesQueryKeys: [[orgKeys.addresses]],
    },
  });
};

export const useSetPrimaryOrganizationAddress = () => {
  return useMutation({
    mutationFn: (id: string) => setPrimaryOrganizationAddress(id),
    meta: {
      successMessage: "Primary address updated",
      invalidatesQueryKeys: [[orgKeys.addresses]],
    },
  });
};

// ─── Bank accounts ───────────────────────────────────────────────────────────

export const useGetOrganizationBankAccounts = (
  config?: QueryConfigType<typeof getOrganizationBankAccounts>,
) => {
  return useQuery({
    queryKey: [orgKeys.bankAccounts],
    queryFn: getOrganizationBankAccounts,
    ...config,
  });
};

export const useCreateOrganizationBankAccount = () => {
  return useMutation({
    mutationFn: (payload: CreateOrgBankAccountPayload) =>
      createOrganizationBankAccount(payload),
    meta: {
      successMessage: "Bank account added successfully",
      invalidatesQueryKeys: [[orgKeys.bankAccounts]],
    },
  });
};

export const useUpdateOrganizationBankAccount = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateOrgBankAccountPayload>;
    }) => updateOrganizationBankAccount(id, payload),
    meta: {
      successMessage: "Bank account updated successfully",
      invalidatesQueryKeys: [[orgKeys.bankAccounts]],
    },
  });
};

export const useDeleteOrganizationBankAccount = () => {
  return useMutation({
    mutationFn: (id: string) => deleteOrganizationBankAccount(id),
    meta: {
      successMessage: "Bank account removed",
      invalidatesQueryKeys: [[orgKeys.bankAccounts]],
    },
  });
};

export const useSetPrimaryOrganizationBankAccount = () => {
  return useMutation({
    mutationFn: (id: string) => setPrimaryOrganizationBankAccount(id),
    meta: {
      successMessage: "Primary bank account updated",
      invalidatesQueryKeys: [[orgKeys.bankAccounts]],
    },
  });
};

// ─── Currencies ──────────────────────────────────────────────────────────────

export const useGetOrganizationCurrencies = (
  config?: QueryConfigType<typeof getOrganizationCurrencies>,
) => {
  return useQuery({
    queryKey: [orgKeys.currencies],
    queryFn: getOrganizationCurrencies,
    ...config,
  });
};

export const useCreateOrganizationCurrency = () => {
  return useMutation({
    mutationFn: (payload: CreateOrgCurrencyPayload) =>
      createOrganizationCurrency(payload),
    meta: {
      successMessage: "Currency added successfully",
      invalidatesQueryKeys: [[orgKeys.currencies]],
    },
  });
};

export const useUpdateOrganizationCurrency = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<
        Omit<CreateOrgCurrencyPayload, "code"> & { isActive: boolean }
      >;
    }) => updateOrganizationCurrency(id, payload),
    meta: {
      successMessage: "Currency updated successfully",
      invalidatesQueryKeys: [[orgKeys.currencies]],
    },
  });
};

export const useDeleteOrganizationCurrency = () => {
  return useMutation({
    mutationFn: (id: string) => deleteOrganizationCurrency(id),
    meta: {
      successMessage: "Currency removed",
      invalidatesQueryKeys: [[orgKeys.currencies]],
    },
  });
};

export const useSetDefaultOrganizationCurrency = () => {
  return useMutation({
    mutationFn: (id: string) => setDefaultOrganizationCurrency(id),
    meta: {
      successMessage: "Default currency updated",
      invalidatesQueryKeys: [[orgKeys.currencies], [orgKeys.details]],
    },
  });
};

// ─── Taxes ───────────────────────────────────────────────────────────────────

export const useGetOrganizationTaxes = (
  config?: QueryConfigType<typeof getOrganizationTaxes>,
) => {
  return useQuery({
    queryKey: [orgKeys.taxes],
    queryFn: getOrganizationTaxes,
    ...config,
  });
};

export const useCreateOrganizationTax = () => {
  return useMutation({
    mutationFn: (payload: CreateOrgTaxPayload) =>
      createOrganizationTax(payload),
    meta: {
      successMessage: "Tax added successfully",
      invalidatesQueryKeys: [[orgKeys.taxes]],
    },
  });
};

export const useUpdateOrganizationTax = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateOrgTaxPayload & { isActive: boolean }>;
    }) => updateOrganizationTax(id, payload),
    meta: {
      successMessage: "Tax updated successfully",
      invalidatesQueryKeys: [[orgKeys.taxes]],
    },
  });
};

export const useDeleteOrganizationTax = () => {
  return useMutation({
    mutationFn: (id: string) => deleteOrganizationTax(id),
    meta: {
      successMessage: "Tax removed",
      invalidatesQueryKeys: [[orgKeys.taxes]],
    },
  });
};

// ─── Transaction series ──────────────────────────────────────────────────────

export const useGetOrganizationTransactionSeries = (
  config?: QueryConfigType<typeof getOrganizationTransactionSeries>,
) => {
  return useQuery({
    queryKey: [orgKeys.transactionSeries],
    queryFn: getOrganizationTransactionSeries,
    ...config,
  });
};

export const useUpdateOrganizationTransactionSeries = () => {
  return useMutation({
    mutationFn: ({
      module,
      payload,
    }: {
      module: TxnSeriesModule;
      payload: UpsertOrgTransactionSeriesPayload;
    }) => updateOrganizationTransactionSeries(module, payload),
    meta: {
      successMessage: "Transaction series saved",
      invalidatesQueryKeys: [[orgKeys.transactionSeries]],
    },
  });
};
