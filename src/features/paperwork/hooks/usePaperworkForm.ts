import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  useGetAllCustomersQuery,
  useGetVehiclesByClientQuery,
} from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import type { ICustomer } from "@/shared/interface/customer";
import type {
  IPaperwork,
  PaperworkFileInput,
} from "@/shared/interface/paperwork";
import {
  useAddPaperworkFilesMutation,
  useCreatePaperworkMutation,
  useDeletePaperworkFileMutation,
  useUpdatePaperworkMutation,
} from "../api/query";
import {
  isStored,
  storedAttachment,
  type PaperworkAttachment,
} from "../utils/attachments";
import {
  CUSTOM_DOCUMENT_TYPE,
  DOCUMENT_TYPE_OPTIONS,
} from "../utils/paperwork";
import { useAttachmentUpload } from "./useAttachmentUpload";

interface UsePaperworkFormArgs {
  /** Provided → edit mode. Omitted → create mode. */
  paperwork?: IPaperwork | null;
  /** Pre-selects (and locks) the owner, e.g. when opened from a customer page. */
  lockedClientId?: string;
  onClose: () => void;
}

/** Minimal customer shape the combobox needs to render a selected label. */
export interface CustomerRef {
  id: string;
  displayName: string;
  phone?: string | null;
  email?: string | null;
}

const validationSchema = Yup.object({
  clientId: Yup.string().required("Customer is required"),
  documentTypeSelect: Yup.string().required("Document type is required"),
  documentTypeCustom: Yup.string().when("documentTypeSelect", {
    is: CUSTOM_DOCUMENT_TYPE,
    then: (s) => s.required("Enter a document type"),
    otherwise: (s) => s.optional(),
  }),
});

const SELECT_VALUES = DOCUMENT_TYPE_OPTIONS.map((o) => o.value);

function initialDocType(paperwork?: IPaperwork | null) {
  if (!paperwork?.documentType) return { select: "", custom: "" };
  if (SELECT_VALUES.includes(paperwork.documentType)) {
    return { select: paperwork.documentType, custom: "" };
  }
  return { select: CUSTOM_DOCUMENT_TYPE, custom: paperwork.documentType };
}

export function usePaperworkForm({
  paperwork,
  lockedClientId,
  onClose,
}: UsePaperworkFormArgs) {
  const isEdit = Boolean(paperwork);
  const paperworkId = paperwork?.id ?? "";
  const docType = initialDocType(paperwork);

  const { mutateAsync: createPaperwork, isPending: creating } =
    useCreatePaperworkMutation();
  const { mutateAsync: updatePaperwork, isPending: updating } =
    useUpdatePaperworkMutation(paperworkId);
  const { mutateAsync: addFiles, isPending: addingFiles } =
    useAddPaperworkFilesMutation(paperworkId);
  const { mutateAsync: removeFile, isPending: removingFile } =
    useDeletePaperworkFileMutation(paperworkId);
  const { uploadPending, uploading } = useAttachmentUpload();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [customerCache, setCustomerCache] = useState<
    Record<string, CustomerRef>
  >({});

  const saving =
    uploading || creating || updating || addingFiles || removingFile;

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      clientId: paperwork?.clientId ?? lockedClientId ?? "",
      vehicleId: paperwork?.vehicleId ?? "",
      documentTypeSelect: docType.select,
      documentTypeCustom: docType.custom,
      issueDate: paperwork?.issueDate?.slice(0, 10) ?? "",
      expiryDate: paperwork?.expiryDate?.slice(0, 10) ?? "",
      issuer: paperwork?.issuer ?? "",
      referenceNumber: paperwork?.referenceNumber ?? "",
      notes: paperwork?.notes ?? "",
      attachments: (paperwork?.files ?? []).map(
        storedAttachment,
      ) as PaperworkAttachment[],
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitError(null);

      const documentType =
        values.documentTypeSelect === CUSTOM_DOCUMENT_TYPE
          ? values.documentTypeCustom.trim()
          : values.documentTypeSelect;

      // Dates and the vehicle link are validated as date/uuid server-side, so
      // they can only be sent when set — an empty one means "leave as is".
      const dated = {
        ...(values.vehicleId ? { vehicleId: values.vehicleId } : {}),
        ...(values.issueDate ? { issueDate: values.issueDate } : {}),
        ...(values.expiryDate ? { expiryDate: values.expiryDate } : {}),
      };

      // Upload first — a failed upload should leave the record untouched.
      let uploaded: PaperworkFileInput[] = [];
      try {
        uploaded = await uploadPending(values.attachments);
      } catch {
        setSubmitError("Some files failed to upload. Please try again.");
        return;
      }

      if (isEdit) {
        // The update endpoint rejects unknown fields (clientId among them), and
        // text fields are sent even when blank so they can be cleared.
        await updatePaperwork({
          documentType,
          issuer: values.issuer,
          referenceNumber: values.referenceNumber,
          notes: values.notes,
          ...dated,
        });

        // Attachments live behind their own endpoints, so sync them separately.
        const kept = new Set(
          values.attachments.filter(isStored).map((a) => a.file.id),
        );
        const removed = (paperwork?.files ?? []).filter((f) => !kept.has(f.id));

        for (const file of removed) await removeFile(file.id);
        if (uploaded.length) await addFiles(uploaded);
      } else {
        await createPaperwork({
          clientId: values.clientId,
          documentType,
          ...dated,
          ...(values.issuer ? { issuer: values.issuer } : {}),
          ...(values.referenceNumber
            ? { referenceNumber: values.referenceNumber }
            : {}),
          ...(values.notes ? { notes: values.notes } : {}),
          ...(uploaded.length ? { files: uploaded } : {}),
        });
      }

      onClose();
    },
  });

  const customersQuery = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(customerSearch ? { search: customerSearch } : {}),
  });
  const customerArray: ICustomer[] = useMemo(
    () => customersQuery.data?.data ?? [],
    [customersQuery.data?.data],
  );

  // Cache customers by id so the selected one keeps its label when the search
  // result set changes (server-side search) or on edit.
  useEffect(() => {
    if (!customerArray.length) return;
    setCustomerCache((prev) => {
      const next = { ...prev };
      customerArray.forEach((c) => {
        next[c.id] = {
          id: c.id,
          displayName: c.displayName,
          phone: c.phone,
          email: c.email,
        };
      });
      return next;
    });
  }, [customerArray]);

  // Seed the current owner (edit mode) so its label shows before any search.
  useEffect(() => {
    const c = paperwork?.client;
    if (!c) return;
    setCustomerCache((prev) => ({
      ...prev,
      [c.id]: {
        id: c.id,
        displayName: c.displayName ?? "Selected customer",
        phone: c.phone,
        email: c.email,
      },
    }));
  }, [paperwork]);

  const selectedCustomer = customerCache[formik.values.clientId] ?? null;

  const customerOptions = useMemo(() => {
    const opts: { label: string; value: string; subLabel?: string }[] =
      customerArray.map((c) => ({
        label: c.displayName,
        value: c.id,
        subLabel: c.phone ?? c.email ?? undefined,
      }));
    // Keep the selected owner selectable even when it's outside the result set.
    if (
      selectedCustomer &&
      !opts.some((o) => o.value === selectedCustomer.id)
    ) {
      opts.unshift({
        label: selectedCustomer.displayName,
        value: selectedCustomer.id,
        subLabel: selectedCustomer.phone ?? selectedCustomer.email ?? undefined,
      });
    }
    return opts;
  }, [customerArray, selectedCustomer]);

  const { data: vehiclesData, isLoading: vehiclesLoading } =
    useGetVehiclesByClientQuery(formik.values.clientId);
  const vehicles: Vehicle[] = vehiclesData?.data ?? vehiclesData ?? [];
  const vehicleOptions = vehicles.map((v) => ({
    label: `${v.make} ${v.model}${
      v.registrationNumber ? ` · ${v.registrationNumber}` : ""
    }`,
    value: v.id,
  }));

  const selectCustomer = (clientId: string) => {
    formik.setFieldValue("clientId", clientId);
    formik.setFieldValue("vehicleId", ""); // the old vehicle belongs to someone else
  };

  const handleCustomerCreated = (customer: CustomerRef) => {
    setCustomerCache((prev) => ({ ...prev, [customer.id]: customer }));
    selectCustomer(customer.id);
    setAddCustomerOpen(false);
  };

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
    isEdit,
    saving,
    uploading,
    submitError,
    err,
    handleClose,
    // Customer
    customerOptions,
    customersLoading: customersQuery.isFetching,
    setCustomerSearch,
    selectCustomer,
    addCustomerOpen,
    setAddCustomerOpen,
    handleCustomerCreated,
    // Vehicle
    vehicleOptions,
    vehiclesLoading,
  };
}
