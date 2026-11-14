import { useMutation, useQuery } from "@/lib/react-query";
import { customQueryKey } from "@/shared/constants/query-keys";
import type { ReportFileFormat, ReportParams } from "@/shared/interface/report";
import {
  downloadReportFile,
  downloadReportPdf,
  getReport,
  getReportCatalog,
} from "./service";

export const useGetReportCatalogQuery = (enabled = true) =>
  useQuery({
    queryKey: [customQueryKey.reports.catalog],
    queryFn: getReportCatalog,
    enabled,
  });

/**
 * A report is the books as they are now, so it is asked afresh each time it
 * is opened; the last answer stays on screen while a new period or filter
 * loads.
 */
export const useGetReportQuery = (
  key: string,
  params: ReportParams,
  enabled = true,
) =>
  useQuery({
    queryKey: [customQueryKey.reports.run, key, params],
    queryFn: () => getReport(key, params),
    enabled: Boolean(key) && enabled,
    staleTime: 0,
    // Only the same report's: a drill-down to another starts clean.
    placeholderData: (previous, previousQuery) =>
      previousQuery?.queryKey[1] === key ? previous : undefined,
  });

export type ReportDownloadFormat = "pdf" | ReportFileFormat;

/** Failures toast globally (a 402 with the upgrade). */
export const useDownloadReportMutation = () =>
  useMutation({
    mutationFn: ({
      key,
      params,
      format,
    }: {
      key: string;
      params: ReportParams;
      format: ReportDownloadFormat;
    }) =>
      format === "pdf"
        ? downloadReportPdf(key, params)
        : downloadReportFile(key, params, format),
  });
