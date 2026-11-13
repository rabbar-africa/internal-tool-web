import { useCallback, useMemo, useState } from "react";
import { createDownloadLink } from "@/utils/file-helper";
import type { ICreditNote } from "@/shared/interface/credit-note";
import { getCreditNotePdf } from "../api/service";

type NoteRef = Pick<ICreditNote, "id" | "creditNoteNumber">;

const fileNameFor = (note: NoteRef) =>
  `${note.creditNoteNumber || `credit-note-${note.id}`}.pdf`;

/**
 * The credit note's PDF, drawn by the API with the business's Credit Note
 * template (else its invoice look). It names the invoice and the reason, and
 * shows what has been applied, refunded and is left.
 */
export function useCreditNotePdf() {
  const [busyId, setBusyId] = useState<string | null>(null);

  /** Phones only; elsewhere there's nothing to share to. */
  const canShare = useMemo(
    () =>
      typeof navigator !== "undefined" && typeof navigator.share === "function",
    [],
  );

  const getFile = useCallback(async (note: NoteRef) => {
    const blob = await getCreditNotePdf(note.id);
    return new File([blob], fileNameFor(note), { type: "application/pdf" });
  }, []);

  const download = useCallback(
    async (note: NoteRef) => {
      setBusyId(note.id);
      try {
        const file = await getFile(note);
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
    async (note: NoteRef) => {
      const nav = navigator as Navigator & {
        canShare?: (data?: ShareData) => boolean;
      };
      const supportsFileShare = typeof nav.canShare === "function";
      const fallbackWin = supportsFileShare ? null : window.open("", "_blank");

      setBusyId(note.id);
      let file: File;
      try {
        file = await getFile(note);
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
            text: `Credit note ${note.creditNoteNumber}`,
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
