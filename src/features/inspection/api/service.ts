import { axios } from "@/lib/axios";
import type { InspectionPayload } from "../components/generate-inspection/inspection-form.types";
import type {
  DraftAdvisoryPayload,
  InspectionFilter,
  SummarizeNotesPayload,
} from "@/shared/interface/inspection";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

/**
 * Create an inspection record. The PDF is generated on the frontend
 * (see useInspectionPdf), so this returns the saved inspection — the caller
 * redirects to its detail page.
 */
export const createInspection = async (data: InspectionPayload) => {
  const res = await axios.post("/inspections", data);
  return res.data;
};
export const getInspections = async (filters: InspectionFilter = {}) => {
  const baseUrl = "/inspections";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filters);

  const res = await axios.get(apiUrl);
  return res.data;
};

export const updateInspection = async (
  id: string,
  data: Partial<InspectionPayload>,
) => {
  const res = await axios.put(`/inspections/${id}`, data);
  return res.data;
};

export const getInspectionById = async (id: string) => {
  const res = await axios.get(`/inspections/${id}`);
  return res.data;
};

export const deleteInspection = async (id: string) => {
  const res = await axios.delete(`/inspections/${id}`);
  return res.data;
};

/**
 * Ask the AI to draft an advisory from the findings. Stateless — nothing is
 * saved. The technician reviews and edits the draft, and it is persisted only
 * when the inspection itself is saved.
 */
export const draftInspectionAdvisory = async (data: DraftAdvisoryPayload) => {
  const res = await axios.post("/inspections/ai/advisory", data);
  return res.data;
};

/**
 * Draft the free-text notes summary as HTML. Superseded by the advisory for the
 * checklist report, but the classic PDF still renders `generalNotes`, so this
 * stays available. Stateless — the result lands in the editor for review.
 */
export const summarizeInspectionNotes = async (data: SummarizeNotesPayload) => {
  const res = await axios.post("/inspections/ai/summarize-notes", data);
  return res.data;
};

/** Marks an inspection COMPLETED. Rejected while required checks are unanswered. */
export const completeInspection = async (id: string) => {
  const res = await axios.patch(`/inspections/${id}/complete`);
  return res.data;
};

export const addInspectionPhotos = async (id: string, photos: string[]) => {
  const res = await axios.patch(`/inspections/${id}/photos`, { photos });
  return res.data;
};

export const getVehicleInspectionHistory = async (vehicleId: string) => {
  const res = await axios.get(`/inspections/vehicle/${vehicleId}/history`);
  return res.data;
};
