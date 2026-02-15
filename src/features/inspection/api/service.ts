import { axios } from "@/lib/axios";
import { createDownloadLink } from "@/utils/file-helper";
import type { InspectionFormValues } from "../components/generate-inspection";

export const downloadInspectionReport = async (data: InspectionFormValues) => {
  const res = await axios.post("/inspections/generate", data, {
    responseType: "blob",
  });

  // Extract filename from Content-Disposition header, fallback to default
  const disposition = res.headers["content-disposition"] as string | undefined;
  const filenameMatch = disposition?.match(/filename="?([^"]+)"?/);
  const fileName = filenameMatch?.[1] ?? "inspection-report.pdf";

  // res.data IS the blob when responseType is 'blob'
  createDownloadLink(res.data as Blob, fileName);
};
