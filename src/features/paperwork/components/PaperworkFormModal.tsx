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
import type { IPaperwork } from "@/shared/interface/paperwork";
import { usePaperworkForm } from "../hooks";
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

const DOCUMENT_TYPE_SELECT_OPTIONS = [
  ...DOCUMENT_TYPE_OPTIONS,
  { label: "Other (custom)", value: CUSTOM_DOCUMENT_TYPE },
];

export function PaperworkFormModal({
  open,
  onClose,
  paperwork,
  lockedClientId,
}: PaperworkFormModalProps) {
  const {
    formik,
    isEdit,
    saving,
    uploading,
    submitError,
    err,
    handleClose,
    customerOptions,
    customersLoading,
    setCustomerSearch,
    selectCustomer,
    addCustomerOpen,
    setAddCustomerOpen,
    handleCustomerCreated,
    vehicleOptions,
    vehiclesLoading,
  } = usePaperworkForm({ paperwork, lockedClientId, onClose });

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
                      isLoading={customersLoading}
                      onChange={selectCustomer}
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
                      options={DOCUMENT_TYPE_SELECT_OPTIONS}
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

                    {/* Digital copies */}
                    <FileUploadField
                      value={formik.values.attachments}
                      uploading={uploading}
                      onChange={(attachments) =>
                        formik.setFieldValue("attachments", attachments)
                      }
                    />

                    {submitError && (
                      <Text fontSize="12px" color="error.400">
                        {submitError}
                      </Text>
                    )}

                    <Flex gap="3" justify="flex-end" pt="2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={saving}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={saving}
                        loadingText={uploading ? "Uploading..." : "Saving..."}
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
        onSave={handleCustomerCreated}
      />
    </>
  );
}
