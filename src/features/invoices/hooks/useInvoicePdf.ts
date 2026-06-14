import { createElement, useCallback, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { createDownloadLink } from "@/utils/file-helper";
import type { IInvoiceResponse } from "@/shared/interface/invoice";

/**
 * Client-side invoice PDF generation via @react-pdf/renderer.
 * Renders the invoice document in the browser (no server round-trip) and
 * exposes helpers to get the raw blob / File, an object URL, trigger a
 * download, open in a new tab, or print.
 */

export function useInvoicePdf(invoice?: IInvoiceResponse) {
  const { userOrganization } = useCurrentUser();
  const [isGenerating, setIsGenerating] = useState(false);

  const fileName = useMemo(
    () => `${invoice?.invoiceNumber || `invoice-${invoice?.id ?? ""}`}.pdf`,
    [invoice?.invoiceNumber, invoice?.id],
  );

  /** Render the document to a Blob. */
  const getBlob = useCallback(async (): Promise<Blob> => {
    if (!invoice) throw new Error("No invoice provided");
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
        invoice,
        organization: userOrganization,
      }) as unknown as Parameters<typeof pdf>[0];
      return await pdf(element).toBlob();
    } finally {
      setIsGenerating(false);
    }
  }, [invoice, userOrganization]);

  /** Render the document to a File (named after the invoice). */
  const getFile = useCallback(async (): Promise<File> => {
    const blob = await getBlob();
    return new File([blob], fileName, { type: "application/pdf" });
  }, [getBlob, fileName]);

  /**
   * Render to an object URL. Caller is responsible for revoking it via
   * `URL.revokeObjectURL` once done (unless using `download`/`open`/`print`,
   * which handle cleanup themselves).
   */
  const getBlobUrl = useCallback(async (): Promise<string> => {
    const blob = await getBlob();
    return URL.createObjectURL(blob);
  }, [getBlob]);

  /** Generate and trigger a browser download. */
  const download = useCallback(async (): Promise<void> => {
    const blob = await getBlob();
    createDownloadLink(blob, fileName);
  }, [getBlob, fileName]);

  /** Generate and open the PDF in a new browser tab. */
  const open = useCallback(async (): Promise<void> => {
    const url = await getBlobUrl();
    const win = window.open(url, "_blank");
    // Revoke once the tab has had time to load the document.
    if (win) {
      win.addEventListener("beforeunload", () => URL.revokeObjectURL(url));
    }
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }, [getBlobUrl]);

  /** Generate and open the system print dialog via a hidden iframe. */
  const print = useCallback(async (): Promise<void> => {
    const url = await getBlobUrl();
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
  }, [getBlobUrl]);

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
