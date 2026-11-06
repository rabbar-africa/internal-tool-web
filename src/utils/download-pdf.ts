import { axios } from "@/lib/axios";
import { createDownloadLink } from "./file-helper";

/** `attachment; filename="statement-cash-….pdf"` → the filename. */
export const filenameFrom = (disposition: unknown): string | null => {
  if (typeof disposition !== "string") return null;
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(disposition);
  return match ? decodeURIComponent(match[1]) : null;
};

/** Fetches a PDF from the API and saves it under the server's filename. */
export const downloadPdf = async (
  url: string,
  params: object,
  fallbackFilename: string,
) => {
  const response = await axios.get<Blob>(url, {
    params,
    responseType: "blob",
  });
  createDownloadLink(
    new Blob([response.data], { type: "application/pdf" }),
    filenameFrom(response.headers["content-disposition"]) ?? fallbackFilename,
  );
};
