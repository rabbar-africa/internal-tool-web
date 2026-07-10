import { createElement, useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDownloadLink } from "@/utils/file-helper";
import type { IPaymentReceived } from "@/shared/interface/payment";

/**
 * Client-side payment-receipt PDF generation via @react-pdf/renderer.
 * Mirrors the on-screen <PaymentReceipt/>. The heavy renderer + document are
 * lazy-loaded so the bundle is only fetched when a download is triggered.
 */

const fileNameFor = (payment: IPaymentReceived) =>
  `${payment.paymentNumber || `payment-${payment.id}`}.pdf`;

export function useReceiptPdf() {
  const { userOrganization } = useCurrentUser();
  const [isGenerating, setIsGenerating] = useState(false);

  // Whether to offer the "Send PDF" action. We only require navigator.share to
  // exist (true on iOS Safari, iOS Chrome, Android). iOS Chrome exposes share
  // but can't share *files* (no navigator.canShare), so share() below detects
  // that at call time and falls back to opening the PDF in a viewer instead.
  const canShareFiles = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.share === "function";
  }, []);

  const getBlob = useCallback(
    async (payment: IPaymentReceived): Promise<Blob> => {
      setIsGenerating(true);
      try {
        const [{ pdf }, { PaymentReceiptDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("../components/payment-detail/pdf/PaymentReceiptDocument"),
        ]);
        // The document renders a <Document>, but its prop type doesn't
        // structurally match react-pdf's DocumentProps — cast to pdf()'s arg.
        const element = createElement(PaymentReceiptDocument, {
          payment,
          organization: userOrganization,
        }) as unknown as Parameters<typeof pdf>[0];
        return await pdf(element).toBlob();
      } finally {
        setIsGenerating(false);
      }
    },
    [userOrganization],
  );

  /** Render the receipt to a File (named after the payment). */
  const getFile = useCallback(
    async (payment: IPaymentReceived): Promise<File> => {
      const blob = await getBlob(payment);
      return new File([blob], fileNameFor(payment), {
        type: "application/pdf",
      });
    },
    [getBlob],
  );

  /** Generate and trigger a browser download. */
  const download = useCallback(
    async (payment: IPaymentReceived): Promise<void> => {
      const blob = await getBlob(payment);
      createDownloadLink(blob, fileNameFor(payment));
    },
    [getBlob],
  );

  /**
   * Generate the receipt PDF and hand it to the OS share sheet (Web Share API
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

  return { download, getBlob, getFile, share, canShareFiles, isGenerating };
}
