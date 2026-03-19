import { useMutation } from "@/lib/react-query";
import { downloadInspectionReport } from "./service";
import type { InspectionPayload } from "../components/generate-inspection/inspection-form.types";

export const useGenerateInspectionReportMutation = () =>
  useMutation({
    mutationFn: (data: InspectionPayload) => downloadInspectionReport(data),
    meta: {
      successMessage: "Inspection report downloaded successfully",
      //   errorMessage: "Failed to generate report. Please try again.",
    },
  });
