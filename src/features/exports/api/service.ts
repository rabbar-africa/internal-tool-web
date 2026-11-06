import { axios } from "@/lib/axios";
import type { ApiResponse } from "@/shared/interface/api";
import type {
  CreateExportPayload,
  ExportCatalog,
  ExportResult,
} from "@/shared/interface/export";
import { createDownloadLink } from "@/utils/file-helper";
import { filenameFrom } from "@/utils/download-pdf";

/** Everything the advanced export form offers this user. */
export const getExportCatalog = async () => {
  const response =
    await axios.get<ApiResponse<ExportCatalog>>("/exports/modules");
  return response.data;
};

/**
 * Builds the file on the server and saves it. A POST, because the body can
 * carry the file's password, which must stay out of URLs and logs.
 */
export const createExport = async (
  payload: CreateExportPayload,
): Promise<ExportResult> => {
  const response = await axios.post<Blob>("/exports", payload, {
    responseType: "blob",
  });
  // The server's name, always: a password turns a CSV or XLS into a ZIP.
  const filename =
    filenameFrom(response.headers["content-disposition"]) ??
    `${payload.module}-export.${payload.fileFormat}`;
  createDownloadLink(response.data, filename);
  return {
    filename,
    rows: Number(response.headers["x-export-rows"]) || 0,
    truncated: response.headers["x-export-truncated"] === "true",
  };
};
