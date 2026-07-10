import { createElement, useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDownloadLink } from "@/utils/file-helper";
import type { IInspection } from "@/shared/interface/inspection";

/**
 * Client-side inspection-report PDF generation via @react-pdf/renderer.
 * Mirrors the on-screen inspection detail. The heavy renderer + document are
 * lazy-loaded so the bundle is only fetched when a PDF action is triggered.
 */

const fileNameFor = (inspection: IInspection) =>
  `${inspection.jobCode || `inspection-${inspection.id}`}.pdf`;

export function useInspectionPdf() {
  const { userOrganization } = useCurrentUser();
  const [isGenerating, setIsGenerating] = useState(false);

  // Whether to offer the "Send" action. We only require navigator.share to
  // exist (true on iOS Safari, iOS Chrome, Android). iOS Chrome exposes share
  // but can't share *files*, so share() below detects that at call time and
  // falls back to opening the PDF in a viewer instead.
  const canShareFiles = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.share === "function";
  }, []);

  const getBlob = useCallback(
    async (inspection: IInspection): Promise<Blob> => {
      setIsGenerating(true);
      try {
        const [{ pdf }, { InspectionPdfDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("../components/inspection-detail/pdf/InspectionPdfDocument"),
        ]);
        // The document renders a <Document>, but its prop type doesn't
        // structurally match react-pdf's DocumentProps — cast to pdf()'s arg.
        const element = createElement(InspectionPdfDocument, {
          inspection,
          organization: userOrganization,
        }) as unknown as Parameters<typeof pdf>[0];
        return await pdf(element).toBlob();
      } finally {
        setIsGenerating(false);
      }
    },
    [userOrganization],
  );

  /** Render the report to a File (named after the inspection). */
  const getFile = useCallback(
    async (inspection: IInspection): Promise<File> => {
      const blob = await getBlob(inspection);
      return new File([blob], fileNameFor(inspection), {
        type: "application/pdf",
      });
    },
    [getBlob],
  );

  /** Generate and trigger a browser download. */
  const download = useCallback(
    async (inspection: IInspection): Promise<void> => {
      const blob = await getBlob(inspection);
      createDownloadLink(blob, fileNameFor(inspection));
    },
    [getBlob],
  );

  /**
   * Generate the report PDF and hand it to the OS share sheet (Web Share API
   * level 2). iOS Safari and Android Chrome share the file directly; iOS
   * Chrome/Firefox/Edge expose navigator.share but can't share files, so there
   * we fall back to opening the PDF in a new tab. The fallback tab must be
   * opened synchronously (before awaiting the PDF) or iOS pop-up-blocks it.
   */
  const share = useCallback(
    async (inspection: IInspection): Promise<void> => {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const supportsFileShare = typeof nav.canShare === "function";
      const fallbackWin = supportsFileShare ? null : window.open("", "_blank");

      let file: File;
      try {
        file = await getFile(inspection);
      } catch {
        fallbackWin?.close();
        return;
      }

      if (supportsFileShare && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: file.name,
            ...(inspection.jobCode
              ? { text: `Inspection Report ${inspection.jobCode}` }
              : {}),
          });
          return;
        } catch (err) {
          // User dismissed the sheet — respect that, don't force a fallback.
          if (err instanceof DOMException && err.name === "AbortError") return;
          // Any other failure: fall through to opening the PDF.
        }
      }

      // Fallback: show the PDF so the user can share/save it from the viewer.
      const url = URL.createObjectURL(file);
      if (fallbackWin) {
        fallbackWin.location.href = url;
      } else {
        const win = window.open(url, "_blank");
        // Popup blocked (e.g. after the await) → download instead.
        if (!win) createDownloadLink(file, file.name);
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [getFile],
  );

  return { download, share, getBlob, getFile, canShareFiles, isGenerating };
}
