import { toaster } from "@/components/ui";
import type { ExportResult } from "@/shared/interface/export";

/** Says what ended up in a file the server built. */
export function announceExport({ rows, truncated }: ExportResult) {
  if (truncated) {
    toaster.create({
      type: "warning",
      description: `Only the first ${rows.toLocaleString()} rows were exported.`,
    });
  } else if (rows === 0) {
    toaster.create({
      type: "info",
      description: "Nothing matched, so the file only has headings.",
    });
  } else {
    toaster.create({
      type: "success",
      description: `Exported ${rows.toLocaleString()} ${
        rows === 1 ? "row" : "rows"
      }.`,
    });
  }
}
