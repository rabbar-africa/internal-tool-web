import { axios } from "@/lib/axios";
import { buildUrlWithQueryParams } from "@/utils/build-url-query";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  ConvertQuotationPayload,
  ConvertQuotationResult,
  CreateQuotationPayload,
  IGetQuotationFilter,
  IQuotation,
  QuotationSummary,
  UpdateQuotationPayload,
} from "@/shared/interface/quotation";

/** Lines go as the API reads them: numbers, in order. */
function normaliseLines<T extends UpdateQuotationPayload>(payload: T): T {
  if (!payload.lineItems) return payload;
  return {
    ...payload,
    lineItems: payload.lineItems.map((li, idx) => ({
      ...li,
      itemOrder: li.itemOrder ?? idx + 1,
      quantity: String(parseFloat(li.quantity) || 0),
      rate: String(
        typeof li.rate === "string" ? parseFloat(li.rate) || 0 : li.rate,
      ),
    })),
  };
}

export const getQuotations = async (filter?: IGetQuotationFilter) => {
  const url = buildUrlWithQueryParams("/quotations", filter);
  const { data } = await axios.get<ApiResponse<IQuotation[]>>(url);
  return data;
};

export const getQuotationSummary = async () => {
  const { data } = await axios.get<ApiResponse<QuotationSummary>>(
    "/quotations/summary",
  );
  return data;
};

export const getQuotationById = async (id: string) => {
  const { data } = await axios.get<ApiResponse<IQuotation>>(
    `/quotations/${id}`,
  );
  return data;
};

/** The PDF the business sends the customer, drawn by the API. */
export const getQuotationPdf = async (id: string) => {
  const { data } = await axios.get<Blob>(`/quotations/${id}/pdf`, {
    responseType: "blob",
  });
  return data;
};

export const createQuotation = async (payload: CreateQuotationPayload) => {
  const { data } = await axios.post<ApiResponse<IQuotation>>(
    "/quotations",
    normaliseLines(payload),
  );
  return data;
};

export const updateQuotation = async (
  id: string,
  payload: UpdateQuotationPayload,
) => {
  const { data } = await axios.put<ApiResponse<IQuotation>>(
    `/quotations/${id}`,
    normaliseLines(payload),
  );
  return data;
};

export type QuotationStatusAction = "send" | "accept" | "decline" | "void";

export const changeQuotationStatus = async (
  id: string,
  action: QuotationStatusAction,
  reason?: string,
) => {
  const { data } = await axios.patch<ApiResponse<IQuotation>>(
    `/quotations/${id}/${action}`,
    action === "decline" && reason ? { reason } : undefined,
  );
  return data;
};

export const convertQuotation = async (
  id: string,
  payload: ConvertQuotationPayload,
) => {
  const { data } = await axios.post<ApiResponse<ConvertQuotationResult>>(
    `/quotations/${id}/convert`,
    payload,
  );
  return data;
};

export const deleteQuotation = async (id: string) => {
  await axios.delete(`/quotations/${id}`);
};
