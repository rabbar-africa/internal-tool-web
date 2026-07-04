import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { AddNewCustomerModal } from "@/features/invoices/components/create-invoice/AddNewCustomerModal";
import { useGetAllCustomersQuery } from "@/features/customers/api/query";
import { useGetVehiclesByClientQuery } from "@/features/customers/api/query";
import type { Vehicle } from "@/features/customers/api/service";
import type { ICustomer } from "@/shared/interface/customer";
import type { IPaperwork } from "@/shared/interface/paperwork";
import {
  useCreatePaperworkMutation,
  useUpdatePaperworkMutation,
} from "../api/query";
import {
  CUSTOM_DOCUMENT_TYPE,
  DOCUMENT_TYPE_OPTIONS,
} from "../utils/paperwork";
import { FileUploadField } from "./FileUploadField";

interface PaperworkFormModalProps {
  open: boolean;
  onClose: () => void;
  /** Provided → edit mode. Omitted → create mode. */
  paperwork?: IPaperwork | null;
  /** Pre-selects (and locks) the owner, e.g. when opened from a customer page. */
  lockedClientId?: string;
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

/** Minimal customer shape the combobox needs to render a selected label. */
type CustomerRef = {
  id: string;
  displayName: string;
  phone?: string | null;
  email?: string | null;
};

function initialDocType(paperwork?: IPaperwork | null) {
  if (!paperwork?.documentType) return { select: "", custom: "" };
  if (SELECT_VALUES.includes(paperwork.documentType)) {
    return { select: paperwork.documentType, custom: "" };
  }
  return { select: CUSTOM_DOCUMENT_TYPE, custom: paperwork.documentType };
}

export function PaperworkFormModal({
  open,
  onClose,
  paperwork,
  lockedClientId,
}: PaperworkFormModalProps) {
  const isEdit = Boolean(paperwork);
  const docType = initialDocType(paperwork);

  const { mutateAsync: createPaperwork, isPending: creating } =
    useCreatePaperworkMutation();
  const { mutateAsync: updatePaperwork, isPending: updating } =
    useUpdatePaperworkMutation(paperwork?.id ?? "");

  const [customerSearch, setCustomerSearch] = useState("");
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [customerCache, setCustomerCache] = useState<
    Record<string, CustomerRef>
  >({});

  const customersQuery = useGetAllCustomersQuery({
    page: 1,
    limit: 30,
    ...(customerSearch ? { search: customerSearch } : {}),
  });
  const customerArray: ICustomer[] = useMemo(
    () => customersQuery.data?.data ?? [],
    [customersQuery.data?.data],
  );

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
      fileUrl: paperwork?.fileUrl ?? "",
      fileName: paperwork?.fileName ?? "",
      fileType: paperwork?.fileType ?? "",
      fileSize: paperwork?.fileSize ?? undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      const documentType =
        values.documentTypeSelect === CUSTOM_DOCUMENT_TYPE
          ? values.documentTypeCustom.trim()
          : values.documentTypeSelect;

      const payload = {
        clientId: values.clientId,
        documentType,
        ...(values.vehicleId ? { vehicleId: values.vehicleId } : {}),
        ...(values.issueDate ? { issueDate: values.issueDate } : {}),
        ...(values.expiryDate ? { expiryDate: values.expiryDate } : {}),
        ...(values.issuer ? { issuer: values.issuer } : {}),
        ...(values.referenceNumber
          ? { referenceNumber: values.referenceNumber }
          : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        ...(values.fileUrl
          ? {
              fileUrl: values.fileUrl,
              fileName: values.fileName || undefined,
              fileType: values.fileType || undefined,
              fileSize: values.fileSize,
            }
          : {}),
      };

      if (isEdit) {
        await updatePaperwork(payload);
      } else {
        await createPaperwork(payload);
      }
      onClose();
    },
  });

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

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const err = (field: keyof typeof formik.values) =>
    formik.touched[field] && formik.errors[field]
      ? (formik.errors[field] as string)
      : undefined;

  return (
    <>
      <Dialog.Root
        open={open}
        onOpenChange={({ open: o }) => {
          if (!o) handleClose();
        }}
        placement="center"
        motionPreset="slide-in-bottom"
        closeOnInteractOutside={false}
      >
        <Portal>
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content
              w="35rem"
              maxW="full"
              borderRadius="2xl"
              pt="2.5rem"
            >
              <Dialog.CloseTrigger asChild>
                <CloseButton position="absolute" top="4" right="4" size="sm" />
              </Dialog.CloseTrigger>
              <Dialog.Body
                overflow="auto"
                maxH="min(44.375rem, calc(100dvh - 4rem))"
                css={chakraScrollbarStyle}
              >
                <form onSubmit={formik.handleSubmit}>
                  <Stack gap="4">
                    <Text fontSize="16px" fontWeight="600" color="gray.500">
                      {isEdit ? "Edit Document" : "Add Document"}
                    </Text>

                    {/* Customer */}
                    <SearchCombobox
                      label="Customer"
                      required
                      placeholder="Search customer..."
                      options={customerOptions}
                      value={formik.values.clientId || undefined}
                      disabled={Boolean(lockedClientId)}
                      serverSearch
                      onSearchChange={setCustomerSearch}
                      searchDebounceMs={400}
                      isLoading={customersQuery.isFetching}
                      onChange={(val) => {
                        formik.setFieldValue("clientId", val);
                        formik.setFieldValue("vehicleId", ""); // reset vehicle
                      }}
                      footerAction={
                        lockedClientId
                          ? undefined
                          : {
                              label: "Add Customer",
                              onClick: () => setAddCustomerOpen(true),
                            }
                      }
                      error={err("clientId")}
                    />

                    {/* Vehicle (optional) */}
                    <CustomSelect
                      label="Vehicle (optional)"
                      placeholder={
                        formik.values.clientId
                          ? "Select a vehicle..."
                          : "Select a customer first"
                      }
                      options={vehicleOptions}
                      loading={vehiclesLoading}
                      disabled={!formik.values.clientId}
                      value={
                        formik.values.vehicleId
                          ? [formik.values.vehicleId]
                          : undefined
                      }
                      onChange={(opt: { value: string[] }) =>
                        formik.setFieldValue("vehicleId", opt?.value?.[0] ?? "")
                      }
                    />

                    {/* Document type */}
                    <CustomSelect
                      label="Document Type"
                      required
                      placeholder="Select document type..."
                      options={[
                        ...DOCUMENT_TYPE_OPTIONS,
                        {
                          label: "Other (custom)",
                          value: CUSTOM_DOCUMENT_TYPE,
                        },
                      ]}
                      value={
                        formik.values.documentTypeSelect
                          ? [formik.values.documentTypeSelect]
                          : undefined
                      }
                      onChange={(opt: { value: string[] }) =>
                        formik.setFieldValue(
                          "documentTypeSelect",
                          opt?.value?.[0] ?? "",
                        )
                      }
                      error={err("documentTypeSelect")}
                    />

                    {formik.values.documentTypeSelect ===
                      CUSTOM_DOCUMENT_TYPE && (
                      <CustomInput
                        label="Custom Document Type"
                        required
                        name="documentTypeCustom"
                        value={formik.values.documentTypeCustom}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. Tinted Glass Permit"
                        error={err("documentTypeCustom")}
                      />
                    )}

                    {/* Dates */}
                    <Grid templateColumns="1fr 1fr" gap="4">
                      <CustomInput
                        label="Issue Date"
                        type="date"
                        name="issueDate"
                        value={formik.values.issueDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      />
                      <CustomInput
                        label="Expiry Date"
                        type="date"
                        name="expiryDate"
                        value={formik.values.expiryDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        helperText="Leave empty if this document never expires."
                      />
                    </Grid>

                    {/* Issuer + reference */}
                    <Grid templateColumns="1fr 1fr" gap="4">
                      <CustomInput
                        label="Issuer"
                        name="issuer"
                        value={formik.values.issuer}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="e.g. FRSC, Leadway"
                      />
                      <CustomInput
                        label="Reference Number"
                        name="referenceNumber"
                        value={formik.values.referenceNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        placeholder="Policy / certificate no."
                      />
                    </Grid>

                    {/* Notes */}
                    <CustomTextArea
                      label="Notes"
                      name="notes"
                      rows={2}
                      value={formik.values.notes}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="Anything worth remembering about this document..."
                    />

                    {/* Digital copy */}
                    <FileUploadField
                      value={{
                        fileUrl: formik.values.fileUrl,
                        fileName: formik.values.fileName,
                        fileSize: formik.values.fileSize,
                      }}
                      onChange={(meta) => {
                        formik.setFieldValue("fileUrl", meta?.fileUrl ?? "");
                        formik.setFieldValue("fileName", meta?.fileName ?? "");
                        formik.setFieldValue("fileType", meta?.fileType ?? "");
                        formik.setFieldValue("fileSize", meta?.fileSize);
                      }}
                    />

                    <Flex gap="3" justify="flex-end" pt="2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={creating || updating}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={creating || updating}
                        loadingText="Saving..."
                      >
                        {isEdit ? "Save Changes" : "Add Document"}
                      </Button>
                    </Flex>
                  </Stack>
                </form>
              </Dialog.Body>
            </Dialog.Content>
          </Dialog.Positioner>
        </Portal>
      </Dialog.Root>

      <AddNewCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSave={(customer) => {
          setCustomerCache((prev) => ({
            ...prev,
            [customer.id]: {
              id: customer.id,
              displayName: customer.displayName,
              phone: customer.phone,
              email: customer.email,
            },
          }));
          formik.setFieldValue("clientId", customer.id);
          formik.setFieldValue("vehicleId", "");
          setAddCustomerOpen(false);
        }}
      />
    </>
  );
}
