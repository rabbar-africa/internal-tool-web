import { useQuery, useMutation, type QueryConfigType } from "@/lib/react-query";
import {
  assignJobCardTechnician,
  attachJobCardFile,
  createJobCard,
  deleteJobCard,
  getJobCardById,
  getJobCardFinancials,
  getJobCards,
  linkJobCardInspection,
  linkJobCardInvoice,
  removeJobCardFile,
  unassignJobCardTechnician,
  unlinkJobCardInspection,
  unlinkJobCardInvoice,
  updateJobCard,
  updateJobCardStatus,
} from "./service";
import type {
  AssignTechnicianPayload,
  AttachJobCardFilePayload,
  CreateJobCardPayload,
  IGetJobCardFilter,
  JobCardStatus,
  UpdateJobCardPayload,
} from "@/shared/interface/job-card";
import { customQueryKey } from "@/shared/constants/query-keys";

const detailInvalidations = [
  [customQueryKey.jobCards.getAll],
  [customQueryKey.jobCards.getById],
  [customQueryKey.jobCards.financials],
];

export const useGetJobCardsQuery = (
  filter?: IGetJobCardFilter,
  config?: QueryConfigType<typeof getJobCards>,
) =>
  useQuery({
    queryKey: [customQueryKey.jobCards.getAll, filter],
    queryFn: () => getJobCards(filter),
    ...config,
  });

export const useGetJobCardByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.jobCards.getById, id],
    queryFn: () => getJobCardById(id),
    enabled: Boolean(id),
  });

export const useGetJobCardFinancialsQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.jobCards.financials, id],
    queryFn: () => getJobCardFinancials(id),
    enabled: Boolean(id),
  });

export const useCreateJobCardMutation = () =>
  useMutation({
    mutationFn: (payload: CreateJobCardPayload) => createJobCard(payload),
    meta: {
      successMessage: "Job card created successfully",
      invalidatesQueryKeys: [[customQueryKey.jobCards.getAll]],
    },
  });

export const useUpdateJobCardMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateJobCardPayload;
    }) => updateJobCard(id, payload),
    meta: {
      successMessage: "Job card updated successfully",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

export const useUpdateJobCardStatusMutation = () =>
  useMutation({
    mutationFn: ({ id, status }: { id: string; status: JobCardStatus }) =>
      updateJobCardStatus(id, status),
    meta: {
      successMessage: "Job card status updated",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

export const useDeleteJobCardMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteJobCard(id),
    meta: {
      successMessage: "Job card deleted",
      invalidatesQueryKeys: [[customQueryKey.jobCards.getAll]],
    },
  });

// ── Technician assignment ────────────────────────────────────────────────────

export const useAssignJobCardTechnicianMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      ...payload
    }: { jobCardId: string } & AssignTechnicianPayload) =>
      assignJobCardTechnician(jobCardId, payload),
    meta: {
      successMessage: "Technician assigned",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

export const useUnassignJobCardTechnicianMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      technicianId,
    }: {
      jobCardId: string;
      technicianId: string;
    }) => unassignJobCardTechnician(jobCardId, technicianId),
    meta: {
      successMessage: "Technician unassigned",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

// ── Files ────────────────────────────────────────────────────────────────────

export const useAttachJobCardFileMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      ...payload
    }: { jobCardId: string } & AttachJobCardFilePayload) =>
      attachJobCardFile(jobCardId, payload),
    meta: {
      successMessage: "File attached",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

export const useRemoveJobCardFileMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      fileId,
    }: {
      jobCardId: string;
      fileId: string;
    }) => removeJobCardFile(jobCardId, fileId),
    meta: {
      successMessage: "File removed",
      invalidatesQueryKeys: detailInvalidations,
    },
  });

// ── Linking invoices / inspections ──────────────────────────────────────────

export const useLinkJobCardInvoiceMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      invoiceId,
    }: {
      jobCardId: string;
      invoiceId: string;
    }) => linkJobCardInvoice(jobCardId, invoiceId),
    meta: {
      successMessage: "Invoice linked to job card",
      invalidatesQueryKeys: [
        ...detailInvalidations,
        [customQueryKey.invoices.getAll],
      ],
    },
  });

export const useUnlinkJobCardInvoiceMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      invoiceId,
    }: {
      jobCardId: string;
      invoiceId: string;
    }) => unlinkJobCardInvoice(jobCardId, invoiceId),
    meta: {
      successMessage: "Invoice unlinked",
      invalidatesQueryKeys: [
        ...detailInvalidations,
        [customQueryKey.invoices.getAll],
      ],
    },
  });

export const useLinkJobCardInspectionMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      inspectionId,
    }: {
      jobCardId: string;
      inspectionId: string;
    }) => linkJobCardInspection(jobCardId, inspectionId),
    meta: {
      successMessage: "Inspection linked to job card",
      invalidatesQueryKeys: [
        ...detailInvalidations,
        [customQueryKey.inspections.getAll],
      ],
    },
  });

export const useUnlinkJobCardInspectionMutation = () =>
  useMutation({
    mutationFn: ({
      jobCardId,
      inspectionId,
    }: {
      jobCardId: string;
      inspectionId: string;
    }) => unlinkJobCardInspection(jobCardId, inspectionId),
    meta: {
      successMessage: "Inspection unlinked",
      invalidatesQueryKeys: [
        ...detailInvalidations,
        [customQueryKey.inspections.getAll],
      ],
    },
  });
