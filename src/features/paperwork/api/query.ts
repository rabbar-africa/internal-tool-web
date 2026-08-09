import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type {
  CreatePaperworkPayload,
  PaperworkFileInput,
  RenewPaperworkPayload,
  UpdatePaperworkPayload,
} from "@/shared/interface/paperwork";
import {
  addPaperworkFiles,
  createPaperwork,
  deletePaperwork,
  deletePaperworkFile,
  getExpiringPaperwork,
  getPaperworkById,
  getPaperworkList,
  renewPaperwork,
  updatePaperwork,
  type ExpiringPaperworkFilter,
  type PaperworkFilter,
} from "./service";

const invalidateAll = [
  [customQueryKey.paperwork.getAll],
  [customQueryKey.paperwork.expiring],
];

export const useGetPaperworkListQuery = (
  filter?: PaperworkFilter,
  config?: QueryConfigType<typeof getPaperworkList>,
) =>
  useQuery({
    queryKey: [customQueryKey.paperwork.getAll, filter],
    queryFn: () => getPaperworkList(filter),
    ...config,
  });

export const useGetExpiringPaperworkQuery = (
  filter?: ExpiringPaperworkFilter,
  config?: QueryConfigType<typeof getExpiringPaperwork>,
) =>
  useQuery({
    queryKey: [customQueryKey.paperwork.expiring, filter],
    queryFn: () => getExpiringPaperwork(filter),
    ...config,
  });

export const useGetPaperworkByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.paperwork.getById, id],
    queryFn: () => getPaperworkById(id),
    enabled: Boolean(id),
  });

export const useCreatePaperworkMutation = () =>
  useMutation({
    mutationFn: (payload: CreatePaperworkPayload) => createPaperwork(payload),
    meta: {
      successMessage: "Document added successfully",
      invalidatesQueryKeys: invalidateAll,
    },
  });

export const useUpdatePaperworkMutation = (id: string) =>
  useMutation({
    mutationFn: (payload: UpdatePaperworkPayload) =>
      updatePaperwork(id, payload),
    meta: {
      successMessage: "Document updated successfully",
      invalidatesQueryKeys: [
        ...invalidateAll,
        [customQueryKey.paperwork.getById, id],
      ],
    },
  });

export const useRenewPaperworkMutation = (id: string) =>
  useMutation({
    mutationFn: (payload: RenewPaperworkPayload) => renewPaperwork(id, payload),
    meta: {
      successMessage: "Document renewed successfully",
      invalidatesQueryKeys: [
        ...invalidateAll,
        [customQueryKey.paperwork.getById, id],
      ],
    },
  });

// Attachment mutations stay quiet — the surrounding save action owns the toast.
export const useAddPaperworkFilesMutation = (id: string) =>
  useMutation({
    mutationFn: (files: PaperworkFileInput[]) => addPaperworkFiles(id, files),
    meta: {
      invalidatesQueryKeys: [
        ...invalidateAll,
        [customQueryKey.paperwork.getById, id],
      ],
    },
  });

export const useDeletePaperworkFileMutation = (id: string) =>
  useMutation({
    mutationFn: (fileId: string) => deletePaperworkFile(id, fileId),
    meta: {
      invalidatesQueryKeys: [
        ...invalidateAll,
        [customQueryKey.paperwork.getById, id],
      ],
    },
  });

export const useDeletePaperworkMutation = () =>
  useMutation({
    mutationFn: (id: string) => deletePaperwork(id),
    meta: {
      successMessage: "Document deleted",
      invalidatesQueryKeys: invalidateAll,
    },
  });
