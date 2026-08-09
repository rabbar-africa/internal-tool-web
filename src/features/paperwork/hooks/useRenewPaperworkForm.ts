import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import type {
  IPaperwork,
  PaperworkFileInput,
} from "@/shared/interface/paperwork";
import { useRenewPaperworkMutation } from "../api/query";
import type { PaperworkAttachment } from "../utils/attachments";
import { useAttachmentUpload } from "./useAttachmentUpload";

interface UseRenewPaperworkFormArgs {
  paperwork: IPaperwork;
  onClose: () => void;
}

const validationSchema = Yup.object({
  expiryDate: Yup.string().required("New expiry date is required"),
});

export function useRenewPaperworkForm({
  paperwork,
  onClose,
}: UseRenewPaperworkFormArgs) {
  const { mutateAsync: renew, isPending } = useRenewPaperworkMutation(
    paperwork.id,
  );
  const { uploadPending, uploading } = useAttachmentUpload();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      issueDate: "",
      expiryDate: "",
      referenceNumber: paperwork.referenceNumber ?? "",
      notes: "",
      attachments: [] as PaperworkAttachment[],
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitError(null);

      // Upload first — a failed upload should leave the document unrenewed.
      let uploaded: PaperworkFileInput[] = [];
      try {
        uploaded = await uploadPending(values.attachments);
      } catch {
        setSubmitError("Some files failed to upload. Please try again.");
        return;
      }

      await renew({
        expiryDate: values.expiryDate,
        ...(values.issueDate ? { issueDate: values.issueDate } : {}),
        ...(values.referenceNumber
          ? { referenceNumber: values.referenceNumber }
          : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        ...(uploaded.length ? { files: uploaded } : {}),
      });

      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    setSubmitError(null);
    onClose();
  };

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field]
      ? (formik.errors[field] as string)
      : undefined;

  return {
    formik,
    saving: uploading || isPending,
    uploading,
    submitError,
    err,
    handleClose,
  };
}
