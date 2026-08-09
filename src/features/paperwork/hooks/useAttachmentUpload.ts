import { useCallback, useState } from "react";
import type { PaperworkFileInput } from "@/shared/interface/paperwork";
import { uploadFile } from "../api/service";
import { isPending, type PaperworkAttachment } from "../utils/attachments";

/**
 * Uploads the locally-picked scans of a form at submit time and hands back the
 * payload shape the paperwork endpoints expect. Already-stored scans are left
 * alone — the caller decides what to do with those.
 */
export function useAttachmentUpload(folder = "paperwork") {
  const [uploading, setUploading] = useState(false);

  const uploadPending = useCallback(
    async (
      attachments: PaperworkAttachment[],
    ): Promise<PaperworkFileInput[]> => {
      const pending = attachments.filter(isPending);
      if (!pending.length) return [];

      setUploading(true);
      try {
        // All-or-nothing: a partial upload would attach an incomplete bundle.
        return await Promise.all(
          pending.map((a) => uploadFile(a.file, folder)),
        );
      } finally {
        setUploading(false);
      }
    },
    [folder],
  );

  return { uploadPending, uploading };
}
