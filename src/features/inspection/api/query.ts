import { useMutation, useQuery, type QueryConfigType } from "@/lib/react-query";
import {
  createInspection,
  updateInspection,
  summarizeInspectionNotes,
  getInspections,
  getInspectionById,
  deleteInspection,
} from "./service";
import type {
  InspectionPayload,
  SummarizeNotesPayload,
} from "../components/generate-inspection/inspection-form.types";
import type { InspectionFilter } from "@/shared/interface/inspection";
import { customQueryKey } from "@/shared/constants/query-keys";

export const useGetAllInspectionsQuery = (
  filters: InspectionFilter = {},
  config?: QueryConfigType<typeof getInspections>,
) =>
  useQuery({
    queryKey: [customQueryKey.inspections.getAll, filters],
    queryFn: () => getInspections(filters),
    ...config,
  });

export const useCreateInspectionMutation = () =>
  useMutation({
    mutationFn: (data: InspectionPayload) => createInspection(data),
    meta: {
      successMessage: "Inspection created successfully",
      invalidatesQueryKeys: [[customQueryKey.inspections.getAll]],
    },
  });

export const useUpdateInspectionMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<InspectionPayload>;
    }) => updateInspection(id, data),
    meta: {
      successMessage: "Inspection updated successfully",
      invalidatesQueryKeys: [
        [customQueryKey.inspections.getAll],
        [customQueryKey.inspections.getById],
      ],
    },
  });

export const useSummarizeInspectionNotesMutation = () =>
  useMutation({
    mutationFn: (data: SummarizeNotesPayload) => summarizeInspectionNotes(data),
  });

export const useGetInspectionByIdQuery = (
  id: string,
  config?: QueryConfigType<typeof getInspectionById>,
) =>
  useQuery({
    queryKey: [customQueryKey.inspections.getById, id],
    queryFn: () => getInspectionById(id),
    enabled: !!id,
    ...config,
  });

export const useDeleteInspectionMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteInspection(id),
    meta: {
      successMessage: "Inspection deleted successfully",
      invalidatesQueryKeys: [[customQueryKey.inspections.getAll]],
    },
  });
