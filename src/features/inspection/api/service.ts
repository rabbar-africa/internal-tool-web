import { axios } from "@/lib/axios";
import { createDownloadLink } from "@/utils/file-helper";
import type {
  InspectionPayload,
  SummarizeNotesPayload,
} from "../components/generate-inspection/inspection-form.types";
import type { InspectionFilter } from "@/shared/interface/inspection";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

export const getInspections = async (filters: InspectionFilter = {}) => {
  const baseUrl = "/inspections";
  const apiUrl = buildUrlWithQueryParams(baseUrl, filters);

  const res = await axios.get(apiUrl);
  return res.data;
};

export const summarizeInspectionNotes = async (data: SummarizeNotesPayload) => {
  const res = await axios.post("/inspections/ai/summarize-notes", data);
  return res.data;
};

export const downloadInspectionReport = async (data: InspectionPayload) => {
  const res = await axios.post("/inspections/generate", data, {
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header, fallback to default
  const disposition = res.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = filenameMatch?.[1] ?? "inspection-report.pdf";

  // res.data IS the blob when responseType is 'blob'
  createDownloadLink(res.data as Blob, fileName);
  return res.data;
};
