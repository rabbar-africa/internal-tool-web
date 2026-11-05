import { useCallback, useMemo } from "react";
import { createDownloadLink } from "@/utils/file-helper";
import type { IPaymentReceived } from "@/shared/interface/payment";
import { useGetReceiptPdfMutation } from "../api/query";

/** Payment-receipt PDFs, rendered by the API. */

const fileNameFor = (payment: IPaymentReceived) =>
  `${payment.paymentNumber || `payment-${payment.id}`}.pdf`;

export function useReceiptPdf() {
  const { mutateAsync: fetchPdf, isPending: isGenerating } =
    useGetReceiptPdfMutation();

  // Whether to offer the "Send PDF" action. We only require navigator.share to
  // exist (true on iOS Safari, iOS Chrome, Android). iOS Chrome exposes share
  // but can't share *files* (no navigator.canShare), so share() below detects
  // that at call time and falls back to opening the PDF in a viewer instead.
  const canShareFiles = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.share === "function";
  }, []);

  /** The receipt as a File (named after the payment). */
  const getFile = useCallback(
    async (payment: IPaymentReceived): Promise<File> => {
      const blob = await fetchPdf(payment.id);
      return new File([blob], fileNameFor(payment), {
        type: "application/pdf",
      });
    },
    [fetchPdf],
  );

  /** Fetch and trigger a browser download. */
  const download = useCallback(
    async (payment: IPaymentReceived): Promise<void> => {
      // On failure the mutation has already shown the error toast.
      const blob = await fetchPdf(payment.id).catch(() => null);
      if (blob) createDownloadLink(blob, fileNameFor(payment));
    },
    [fetchPdf],
  );

  /**
   * Fetch the receipt PDF and hand it to the OS share sheet (Web Share API
   * level 2). iOS Safari and Android Chrome share the file directly; iOS
   * Chrome/Firefox/Edge expose navigator.share but can't share files, so there
   * we fall back to opening the PDF in a new tab. The fallback tab must be
   * opened synchronously (before awaiting the PDF) or iOS pop-up-blocks it.
   */
  const share = useCallback(
    async (payment: IPaymentReceived): Promise<void> => {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const supportsFileShare = typeof nav.canShare === "function";
      const fallbackWin = supportsFileShare ? null : window.open("", "_blank");

      let file: File;
      try {
        file = await getFile(payment);
      } catch {
        fallbackWin?.close();
        return;
      }

      if (supportsFileShare && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: file.name,
            ...(payment.paymentNumber
              ? { text: `Payment ${payment.paymentNumber}` }
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

  return { download, getFile, share, canShareFiles, isGenerating };
}
