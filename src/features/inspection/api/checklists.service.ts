import { axios } from "@/lib/axios";
import type {
  ChecklistFilter,
  CreateChecklistItemPayload,
} from "@/shared/interface/inspection";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";

/**
 * The org's checklist catalog. Inspections carry every item in it, so the
 * inspection form reads the catalog to render its checklist section.
 */
export const getChecklistItems = async (filters: ChecklistFilter = {}) => {
  const res = await axios.get(
    buildUrlWithQueryParams("/checklists", filters as Record<string, unknown>),
  );
  return res.data;
};

/** The catalog keyed by category — what the form's checklist renders from. */
export const getGroupedChecklistItems = async () => {
  const res = await axios.get("/checklists/grouped");
  return res.data;
};

export const getChecklistCategories = async () => {
  const res = await axios.get("/checklists/categories");
  return res.data;
};

export const createChecklistItem = async (data: CreateChecklistItemPayload) => {
  const res = await axios.post("/checklists", data);
  return res.data;
};

export const updateChecklistItem = async (
  id: string,
  data: Partial<CreateChecklistItemPayload>,
) => {
  const res = await axios.put(`/checklists/${id}`, data);
  return res.data;
};

export const deleteChecklistItem = async (id: string) => {
  const res = await axios.delete(`/checklists/${id}`);
  return res.data;
};

/** Seeds the standard catalog for an org that has none yet. Idempotent. */
export const seedDefaultChecklistItems = async () => {
  const res = await axios.post("/checklists/seed-defaults");
  return res.data;
};
