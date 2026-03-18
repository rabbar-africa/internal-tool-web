import { useMutation } from "@/lib/react-query";
import { downloadInspectionReport } from "./service";
import type { InspectionFormValues } from "../components/generate-inspection";

export const useGenerateInspectionReportMutation = () =>
  useMutation({
    mutationFn: (data: InspectionFormValues) => downloadInspectionReport(data),
    meta: {
      successMessage: "Inspection report downloaded successfully",
      //   errorMessage: "Failed to generate report. Please try again.",
    },
  });
