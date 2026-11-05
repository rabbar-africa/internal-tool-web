import { useCallback, useMemo } from "react";
import { createDownloadLink } from "@/utils/file-helper";
import type { IInvoiceResponse } from "@/shared/interface/invoice";
import { useGetInvoicePdfMutation } from "../api/query";

/**
 * Invoice PDFs, rendered by the API so they match what every other channel
 * sends. Exposes helpers to get a File, trigger a download, open in a new tab,
 * or print.
 *
 * Pass an invoice to bind the hook to it (e.g. on the detail page), or omit it
 * and pass a target per-call (e.g. from a list row) — every action accepts an
 * optional override argument.
 */

type InvoicePdfTarget = Pick<IInvoiceResponse, "id" | "invoiceNumber">;

const fileNameFor = (invoice: InvoicePdfTarget) =>
  `${invoice.invoiceNumber || `invoice-${invoice.id ?? ""}`}.pdf`;

/**
 * Installed iOS PWAs (standalone mode) silently swallow `window.open` of a
 * blob URL — the new tab/window never appears. Detect that case so we can fall
 * back to a download instead. Android, desktop, and in-browser iOS are fine.
 */
const isIosStandalone = (): boolean => {
  if (typeof navigator === "undefined" || typeof window === "undefined")
    return false;
  const isIos =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS 13+ reports as a Mac; disambiguate via touch support.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const standalone =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  return isIos && standalone;
};

export function useInvoicePdf(invoice?: IInvoiceResponse) {
  const { mutateAsync: fetchPdf, isPending: isGenerating } =
    useGetInvoicePdfMutation();

  // Whether to offer the "Send PDF" action. We only require navigator.share to
  // exist (true on iOS Safari, iOS Chrome, Android). iOS Chrome exposes share
  // but can't share *files* (no navigator.canShare), so share() below detects
  // that at call time and falls back to opening the PDF in a viewer instead.
  const canShareFiles = useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return typeof navigator.share === "function";
  }, []);

  const fileName = useMemo(
    () => `${invoice?.invoiceNumber || `invoice-${invoice?.id ?? ""}`}.pdf`,
    [invoice?.invoiceNumber, invoice?.id],
  );

  const getBlob = useCallback(
    async (target?: InvoicePdfTarget): Promise<Blob> => {
      const subject = target ?? invoice;
      if (!subject) throw new Error("No invoice provided");
      return fetchPdf(subject.id);
    },
    [invoice, fetchPdf],
  );

  /** Null on failure: the mutation has already shown the error toast. */
  const tryGetBlob = useCallback(
    (target?: InvoicePdfTarget) => getBlob(target).catch(() => null),
    [getBlob],
  );

  /** The PDF as a File (named after the invoice). */
  const getFile = useCallback(
    async (target?: InvoicePdfTarget): Promise<File> => {
      const blob = await getBlob(target);
      const name = target ? fileNameFor(target) : fileName;
      return new File([blob], name, { type: "application/pdf" });
    },
    [getBlob, fileName],
  );

  /** Fetch and trigger a browser download. */
  const download = useCallback(
    async (target?: InvoicePdfTarget): Promise<void> => {
      const blob = await tryGetBlob(target);
      if (!blob) return;
      const name = target ? fileNameFor(target) : fileName;
      createDownloadLink(blob, name);
    },
    [tryGetBlob, fileName],
  );

  /**
   * Fetch the PDF and hand it to the OS share sheet (Web Share API level 2).
   *
   * iOS Safari and Android Chrome can share the file directly (native "Share"
   * menu → WhatsApp, Mail, Drive, …). iOS Chrome/Firefox/Edge expose
   * navigator.share but CANNOT share files, so there we fall back to opening the
   * PDF in a new tab where the browser's own Share/Save controls take over.
   *
   * The fallback tab must be opened synchronously (before awaiting the PDF),
   * otherwise iOS pops-up-blocks it once the user gesture is gone.
   */
  const share = useCallback(
    async (target?: InvoicePdfTarget): Promise<void> => {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      // File-level sharing only exists where navigator.canShare does (iOS
      // Safari, Android). Where it doesn't (iOS Chrome), pre-open a blank tab
      // now, inside the user gesture, so we can show the PDF after generating.
      const supportsFileShare = typeof nav.canShare === "function";
      const fallbackWin = supportsFileShare ? null : window.open("", "_blank");

      let file: File;
      try {
        file = await getFile(target);
      } catch {
        fallbackWin?.close();
        return;
      }

      const subject = target ?? invoice;

      if (supportsFileShare && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: file.name,
            ...(subject?.invoiceNumber
              ? { text: `Invoice ${subject.invoiceNumber}` }
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
        // Popup blocked (e.g. after the await on a stricter browser) → download.
        if (!win) createDownloadLink(file, file.name);
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [getFile, invoice],
  );

  /** Fetch and open the PDF in a new browser tab. */
  const open = useCallback(
    async (target?: InvoicePdfTarget): Promise<void> => {
      // Opened now, inside the tap: browsers block a tab opened after a network
      // wait. Installed iOS PWAs can't open a blob URL in a new tab at all, so
      // those (and blocked popups) download instead — the user can preview or
      // share it from Files.
      const win = isIosStandalone() ? null : window.open("", "_blank");
      const blob = await tryGetBlob(target);
      if (!blob) {
        win?.close();
        return;
      }
      if (!win) {
        createDownloadLink(blob, target ? fileNameFor(target) : fileName);
        return;
      }
      const url = URL.createObjectURL(blob);
      win.location.href = url;
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [tryGetBlob, fileName],
  );

  /** Fetch and open the system print dialog via a hidden iframe. */
  const print = useCallback(
    async (target?: InvoicePdfTarget): Promise<void> => {
      const blob = await tryGetBlob(target);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = url;
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      };
      document.body.appendChild(iframe);
      // Cleanup well after the print dialog has been handled.
      window.setTimeout(() => {
        iframe.remove();
        URL.revokeObjectURL(url);
      }, 60_000);
    },
    [tryGetBlob],
  );

  return {
    fileName,
    isGenerating,
    canShareFiles,
    getFile,
    download,
    share,
    open,
    print,
  };
}
