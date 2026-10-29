import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  createAccountTransfer,
  deleteAccountTransfer,
  getAccountTransferById,
  getAccountTransfers,
  updateAccountTransfer,
} from "./service";
import type {
  CreateAccountTransferPayload,
  IGetAccountTransfersFilter,
  UpdateAccountTransferPayload,
} from "@/shared/interface/banking";
import { customQueryKey } from "@/shared/constants/query-keys";

const transferKeys = customQueryKey.accountTransfers;

const transferInvalidations = [[transferKeys.getAll], [transferKeys.getById]];

export const useGetAccountTransfersQuery = (
  filter?: IGetAccountTransfersFilter,
  config?: QueryConfigType<typeof getAccountTransfers>,
) =>
  useQuery({
    queryKey: [transferKeys.getAll, filter],
    queryFn: () => getAccountTransfers(filter),
    ...config,
  });

export const useGetAccountTransferByIdQuery = (id: string) =>
  useQuery({
    queryKey: [transferKeys.getById, id],
    queryFn: () => getAccountTransferById(id),
    enabled: Boolean(id),
  });

export const useCreateAccountTransferMutation = () =>
  useMutation({
    mutationFn: (payload: CreateAccountTransferPayload) =>
      createAccountTransfer(payload),
    meta: {
      successMessage: "Transfer recorded",
      invalidatesQueryKeys: transferInvalidations,
    },
  });

export const useUpdateAccountTransferMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateAccountTransferPayload;
    }) => updateAccountTransfer(id, payload),
    meta: {
      successMessage: "Transfer updated",
      invalidatesQueryKeys: transferInvalidations,
    },
  });

export const useDeleteAccountTransferMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteAccountTransfer(id),
    meta: {
      successMessage: "Transfer deleted",
      invalidatesQueryKeys: transferInvalidations,
    },
  });
