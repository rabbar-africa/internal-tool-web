import { axios } from "@/lib/axios";
import type {
  InspectionPayload,
  SummarizeNotesPayload,
} from "../components/generate-inspection/inspection-form.types";
import type { InspectionFilter } from "@/shared/interface/inspection";
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

export const getInspectionById = async (id: string) => {
  const res = await axios.get(`/inspections/${id}`);
  return res.data;
};

export const deleteInspection = async (id: string) => {
  const res = await axios.delete(`/inspections/${id}`);
  return res.data;
};

export const summarizeInspectionNotes = async (data: SummarizeNotesPayload) => {
  const res = await axios.post("/inspections/ai/summarize-notes", data);
  return res.data;
};
