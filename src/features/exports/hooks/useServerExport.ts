import type {
  ExportModuleKey,
  ServerExportRequest,
} from "@/shared/interface/export";
import { useCreateExportMutation } from "../api";
import { announceExport } from "../utils/announce-export";

/** A one-click CSV that the server builds; failures toast globally. */
export function useServerExport(module: ExportModuleKey | undefined) {
  const { mutate, isPending } = useCreateExportMutation();

  const run = (request: ServerExportRequest) => {
    if (!module) return;
    mutate(
      { module, fileFormat: "csv", includePii: false, ...request },
      { onSuccess: announceExport },
    );
  };

  return { run, isPending };
}
