import { useMutation, useQuery, type QueryConfigType } from "@/lib/react-query";
import {
  addInspectionPhotos,
  completeInspection,
  createInspection,
  deleteInspection,
  draftInspectionAdvisory,
  getInspectionById,
  getInspections,
  getVehicleInspectionHistory,
  summarizeInspectionNotes,
  updateInspection,
} from "./service";
import type { InspectionPayload } from "../components/generate-inspection/inspection-form.types";
import type {
  DraftAdvisoryPayload,
  InspectionFilter,
  SummarizeNotesPayload,
} from "@/shared/interface/inspection";
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

/** Drafts an advisory for review. Deliberately has no success toast — the
 *  result lands in the form for the technician to edit before saving. */
export const useDraftAdvisoryMutation = () =>
  useMutation({
    mutationFn: (data: DraftAdvisoryPayload) => draftInspectionAdvisory(data),
  });

/** Drafts the HTML notes summary the classic PDF renders. No success toast —
 *  the result goes into the editor for the technician to review. */
export const useSummarizeInspectionNotesMutation = () =>
  useMutation({
    mutationFn: (data: SummarizeNotesPayload) => summarizeInspectionNotes(data),
  });

export const useCompleteInspectionMutation = () =>
  useMutation({
    mutationFn: (id: string) => completeInspection(id),
    meta: {
      successMessage: "Inspection marked as completed",
      invalidatesQueryKeys: [
        [customQueryKey.inspections.getAll],
        [customQueryKey.inspections.getById],
      ],
    },
  });

export const useAddInspectionPhotosMutation = (id: string) =>
  useMutation({
    mutationFn: (photos: string[]) => addInspectionPhotos(id, photos),
    meta: {
      successMessage: "Photos added",
      invalidatesQueryKeys: [[customQueryKey.inspections.getById, id]],
    },
  });

export const useGetVehicleInspectionHistoryQuery = (
  vehicleId: string,
  config?: QueryConfigType<typeof getVehicleInspectionHistory>,
) =>
  useQuery({
    queryKey: [customQueryKey.inspections.vehicleHistory, vehicleId],
    queryFn: () => getVehicleInspectionHistory(vehicleId),
    enabled: !!vehicleId,
    ...config,
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
