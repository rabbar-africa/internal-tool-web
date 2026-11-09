import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryConfigType,
} from "@/lib/react-query";
import type { ApiResponse } from "@/shared/interface/api";
import { customQueryKey } from "@/shared/constants/query-keys";
import { invalidates } from "@/shared/constants/query-invalidations";
import type {
  ConvertQuotationPayload,
  CreateQuotationPayload,
  IGetQuotationFilter,
  UpdateQuotationPayload,
} from "@/shared/interface/quotation";
import {
  changeQuotationStatus,
  convertQuotation,
  createQuotation,
  deleteQuotation,
  getQuotationById,
  getQuotationSummary,
  getQuotations,
  updateQuotation,
  type QuotationStatusAction,
} from "./service";
import type { IQuotation } from "@/shared/interface/quotation";

/**
 * Edits and status moves answer with the quote as it now is: show that at
 * once rather than the old copy until the refetch lands.
 */
function useCacheQuote() {
  const queryClient = useQueryClient();
  return (response: ApiResponse<IQuotation>) => {
    if (!response?.data?.id) return;
    queryClient.setQueryData(
      [customQueryKey.quotations.getById, response.data.id],
      response,
    );
  };
}

export const useGetQuotationsQuery = (
  filter?: IGetQuotationFilter,
  config?: QueryConfigType<typeof getQuotations>,
) =>
  useQuery({
    queryKey: [customQueryKey.quotations.getAll, filter],
    queryFn: () => getQuotations(filter),
    ...config,
  });

export const useGetQuotationSummaryQuery = () =>
  useQuery({
    queryKey: [customQueryKey.quotations.summary],
    queryFn: getQuotationSummary,
  });

export const useGetQuotationByIdQuery = (id: string) =>
  useQuery({
    queryKey: [customQueryKey.quotations.getById, id],
    queryFn: () => getQuotationById(id),
    enabled: Boolean(id),
  });

export const useCreateQuotationMutation = () =>
  useMutation({
    mutationFn: (payload: CreateQuotationPayload) => createQuotation(payload),
    meta: {
      successMessage: "Quote created",
      invalidatesQueryKeys: invalidates.quotationCreated,
    },
  });

export const useUpdateQuotationMutation = () => {
  const cacheQuote = useCacheQuote();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateQuotationPayload;
    }) => updateQuotation(id, payload),
    onSuccess: cacheQuote,
    meta: {
      successMessage: "Quote updated",
      invalidatesQueryKeys: invalidates.quotation,
    },
  });
};

export const useChangeQuotationStatusMutation = () => {
  const cacheQuote = useCacheQuote();
  return useMutation({
    mutationFn: ({
      id,
      action,
      reason,
    }: {
      id: string;
      action: QuotationStatusAction;
      reason?: string;
    }) => changeQuotationStatus(id, action, reason),
    onSuccess: cacheQuote,
    // The page says what happened: the message depends on the action.
    meta: { invalidatesQueryKeys: invalidates.quotation },
  });
};

export const useConvertQuotationMutation = () =>
  useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ConvertQuotationPayload;
    }) => convertQuotation(id, payload),
    meta: {
      successMessage: "Invoice created from quote",
      invalidatesQueryKeys: invalidates.quotationConverted,
    },
  });

export const useDeleteQuotationMutation = () =>
  useMutation({
    mutationFn: (id: string) => deleteQuotation(id),
    meta: {
      successMessage: "Quote deleted",
      invalidatesQueryKeys: invalidates.quotation,
    },
  });
