import { useMutation, useQuery } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { CreateExportPayload } from "@/shared/interface/export";
import { createExport, getExportCatalog } from "./service";

export const useGetExportCatalogQuery = (enabled = true) =>
  useQuery({
    queryKey: [customQueryKey.exports.modules],
    queryFn: getExportCatalog,
    enabled,
    // Changes only when the backend ships a module or the user's role changes.
    staleTime: 30 * 60_000,
  });

export const useCreateExportMutation = () =>
  useMutation({
    mutationFn: (payload: CreateExportPayload) => createExport(payload),
  });
