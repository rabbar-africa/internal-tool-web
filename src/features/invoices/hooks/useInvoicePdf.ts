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
    getBlob,
    getFile,
    getBlobUrl,
    download,
    open,
    print,
  };
}
