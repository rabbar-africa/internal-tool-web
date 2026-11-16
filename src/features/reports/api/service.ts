import { axios } from "@/lib/axios";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  ReportCatalog,
  ReportFileFormat,
  ReportParams,
  ReportResult,
} from "@/shared/interface/report";
import { createDownloadLink } from "@/utils/file-helper";
import { downloadPdf, filenameFrom } from "@/utils/download-pdf";

/** The Reports page: sections, the reports this person may run, links. */
export const getReportCatalog = async () => {
  const response = await axios.get<ApiResponse<ReportCatalog>>("/reports");
  return response.data.data;
};

/** One report, run on the period, basis and filters in `params`. */
export const getReport = async (key: string, params: ReportParams) => {
  const response = await axios.get<ApiResponse<ReportResult>>(
    `/reports/${encodeURIComponent(key)}`,
    { params },
  );
  return response.data.data;
};

/** The report as the business's PDF, saved under the server's name. */
export const downloadReportPdf = (key: string, params: ReportParams) =>
  downloadPdf(
    `/reports/${encodeURIComponent(key)}/pdf`,
    params,
    `${key}-report.pdf`,
  );

/** The report as CSV or Excel, saved under the server's name. */
export const downloadReportFile = async (
  key: string,
  params: ReportParams,
  format: ReportFileFormat,
) => {
  const response = await axios.get<Blob>(
    `/reports/${encodeURIComponent(key)}/export`,
    { params: { ...params, format }, responseType: "blob" },
  );
  createDownloadLink(
    response.data,
    filenameFrom(response.headers["content-disposition"]) ??
      `${key}-report.${format}`,
  );
};
