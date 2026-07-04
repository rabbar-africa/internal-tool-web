import { createElement, useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDownloadLink } from "@/utils/file-helper";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

/**
 * Client-side invoice PDF generation via @react-pdf/renderer.
 * Renders the invoice document in the browser (no server round-trip) and
 * exposes helpers to get the raw blob / File, an object URL, trigger a
 * download, open in a new tab, or print.
 *
 * Pass an invoice to bind the hook to it (e.g. on the detail page), or omit it
 * and pass a target per-call (e.g. from a list row, after fetching the full
 * invoice) — every action accepts an optional override argument.
 */

const fileNameFor = (invoice: IInvoiceResponse) =>
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

  const fileName = useMemo(
    () => `${invoice?.invoiceNumber || `invoice-${invoice?.id ?? ""}`}.pdf`,
    [invoice?.invoiceNumber, invoice?.id],
  );

  /** Render the document to a Blob. */
  const getBlob = useCallback(
    async (target?: IInvoiceResponse): Promise<Blob> => {
      const subject = target ?? invoice;
      if (!subject) throw new Error("No invoice provided");
      setIsGenerating(true);
      try {
        // Lazy-loaded so the heavy @react-pdf/renderer bundle is only fetched
        // when a PDF action is actually triggered, not on page load.
        const [{ pdf }, { InvoicePdfDocument }] = await Promise.all([
          import("@react-pdf/renderer"),
          import("../components/invoice-detail/pdf/InvoicePdfDocument"),
        ]);
        // InvoicePdfDocument renders a <Document>, but its prop type doesn't
        // structurally match react-pdf's DocumentProps — cast to pdf()'s
        // expected element type.
        const element = createElement(InvoicePdfDocument, {
          invoice: subject,
          organization: userOrganization,
        }) as unknown as Parameters<typeof pdf>[0];
        return await pdf(element).toBlob();
      } finally {
        setIsGenerating(false);
      }
    },
    [invoice, userOrganization],
  );

  /** Render the document to a File (named after the invoice). */
  const getFile = useCallback(
    async (target?: IInvoiceResponse): Promise<File> => {
      const blob = await getBlob(target);
      const name = target ? fileNameFor(target) : fileName;
      return new File([blob], name, { type: "application/pdf" });
    },
    [getBlob, fileName],
  );

  /**
   * Render to an object URL. Caller is responsible for revoking it via
   * `URL.revokeObjectURL` once done (unless using `download`/`open`/`print`,
   * which handle cleanup themselves).
   */
  const getBlobUrl = useCallback(
    async (target?: IInvoiceResponse): Promise<string> => {
      const blob = await getBlob(target);
      return URL.createObjectURL(blob);
    },
    [getBlob],
  );

  /** Generate and trigger a browser download. */
  const download = useCallback(
    async (target?: IInvoiceResponse): Promise<void> => {
      const blob = await getBlob(target);
      const name = target ? fileNameFor(target) : fileName;
      createDownloadLink(blob, name);
    },
    [getBlob, fileName],
  );

  /**
   * Generate the PDF and hand it to the OS share sheet (Web Share API level 2).
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
    async (target?: IInvoiceResponse): Promise<void> => {
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

  /** Generate and open the PDF in a new browser tab. */
  const open = useCallback(
    async (target?: IInvoiceResponse): Promise<void> => {
      // Installed iOS PWAs can't open a blob URL in a new tab — download instead
      // so the user still gets the PDF (they can preview/share it from Files).
      if (isIosStandalone()) {
        const blob = await getBlob(target);
        const name = target ? fileNameFor(target) : fileName;
        createDownloadLink(blob, name);
        return;
      }
      const url = await getBlobUrl(target);
      const win = window.open(url, "_blank");
      // Revoke once the tab has had time to load the document.
      if (win) {
        win.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    },
    [getBlobUrl, getBlob, fileName],
  );

  /** Generate and open the system print dialog via a hidden iframe. */
  const print = useCallback(
    async (target?: IInvoiceResponse): Promise<void> => {
      const url = await getBlobUrl(target);
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
    [getBlobUrl],
  );

  return {
    fileName,
    isGenerating,
    canShareFiles,
    getBlob,
    getFile,
    getBlobUrl,
    download,
    share,
    open,
    print,
  };
}
