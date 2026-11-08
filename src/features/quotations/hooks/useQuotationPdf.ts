import { useCallback, useMemo, useState } from "react";
import { createDownloadLink } from "@/utils/file-helper";
import type { IQuotation } from "@/shared/interface/quotation";
import { getQuotationPdf } from "../api/service";

type QuoteRef = Pick<IQuotation, "id" | "quotationNumber">;

const fileNameFor = (quote: QuoteRef) =>
  `${quote.quotationNumber || `quotation-${quote.id}`}.pdf`;

/**
 * The quote's PDF, drawn by the API with the business's Estimate template.
 * Neither downloading nor sharing changes the quote's status: the business
 * sends it itself, then marks it sent.
 */
export function useQuotationPdf() {
  const [busyId, setBusyId] = useState<string | null>(null);

  /** Phones only; elsewhere there's nothing to share to. */
  const canShare = useMemo(
    () =>
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    [],
  );

  const getFile = useCallback(async (quote: QuoteRef) => {
    const blob = await getQuotationPdf(quote.id);
    return new File([blob], fileNameFor(quote), { type: "application/pdf" });
  }, []);

  const download = useCallback(
    async (quote: QuoteRef) => {
      setBusyId(quote.id);
      try {
        const file = await getFile(quote);
        createDownloadLink(file, file.name);
        return true;
      } catch {
        // The global error toast has said why.
        return false;
      } finally {
        setBusyId(null);
      }
    },
    [getFile],
  );

  /**
   * Opens the phone's share sheet (WhatsApp, Mail, …). Where files can't be
   * shared (iOS Chrome), the PDF opens in a tab instead, whose own Share
   * button takes over; that tab is opened now, inside the tap, or iOS blocks it.
   */
  const share = useCallback(
    async (quote: QuoteRef) => {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const supportsFileShare = typeof nav.canShare === "function";
      const fallbackWin = supportsFileShare ? null : window.open("", "_blank");

      setBusyId(quote.id);
      let file: File;
      try {
        file = await getFile(quote);
      } catch {
        fallbackWin?.close();
        return false;
      } finally {
        setBusyId(null);
      }

      if (supportsFileShare && nav.canShare?.({ files: [file] })) {
        try {
          await nav.share({
            files: [file],
            title: file.name,
            text: `Quotation ${quote.quotationNumber}`,
          });
          return true;
        } catch (err) {
          if (err instanceof DOMException && err.name === "AbortError") {
            return false;
          }
        }
      }

      const url = URL.createObjectURL(file);
      if (fallbackWin) fallbackWin.location.href = url;
      else if (!window.open(url, "_blank")) createDownloadLink(file, file.name);
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
      return true;
    },
    [getFile],
  );

  return { download, share, canShare, busyId };
}
