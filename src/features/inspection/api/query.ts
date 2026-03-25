import { useMutation } from "@/lib/react-query";
import { downloadInspectionReport, summarizeInspectionNotes } from "./service";
import type {
  InspectionPayload,
  SummarizeNotesPayload,
} from "../components/generate-inspection/inspection-form.types";

export const useGenerateInspectionReportMutation = () =>
  useMutation({
    mutationFn: (data: InspectionPayload) => downloadInspectionReport(data),
    meta: {
      successMessage: "Inspection report downloaded successfully",
    },
  });

export const useSummarizeInspectionNotesMutation = () =>
  useMutation({
    mutationFn: (data: SummarizeNotesPayload) => summarizeInspectionNotes(data),
  });
