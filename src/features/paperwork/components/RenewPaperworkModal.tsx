import {
  Box,
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
import { CustomTextArea } from "@/components/input/CustomTextArea";
import type { IPaperwork } from "@/shared/interface/paperwork";
import { useRenewPaperworkForm } from "../hooks";
import { formatDate, formatDocumentType } from "../utils/paperwork";
import { FileUploadField } from "./FileUploadField";

interface RenewPaperworkModalProps {
  open: boolean;
  onClose: () => void;
  paperwork: IPaperwork;
}

export function RenewPaperworkModal({
  open,
  onClose,
  paperwork,
}: RenewPaperworkModalProps) {
  const { formik, saving, uploading, submitError, err, handleClose } =
    useRenewPaperworkForm({ paperwork, onClose });

  // Renewing replaces the live scans, so say what's about to be archived.
  const currentFileCount = paperwork.files?.length ?? 0;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) handleClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content
            w="31.25rem"
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
                    Renew {formatDocumentType(paperwork.documentType)}
                  </Text>

                  <Box
                    bg="gray.50"
                    rounded="md"
                    px="3"
                    py="2.5"
                    borderWidth="1px"
                    borderColor="gray.75"
                  >
                    <Text fontSize="12px" color="gray.400">
                      Current expiry:{" "}
                      <Text as="span" fontWeight="600" color="gray.500">
                        {formatDate(paperwork.expiryDate)}
                      </Text>
                    </Text>
                    <Text fontSize="11px" color="gray.300" mt="0.5">
                      The current version is archived to history before the new
                      details are applied.
                      {currentFileCount > 0 &&
                        ` Its ${currentFileCount} scan${
                          currentFileCount === 1 ? "" : "s"
                        } move to history too — upload the renewed ones below.`}
                    </Text>
                  </Box>

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="New Issue Date"
                      type="date"
                      name="issueDate"
                      value={formik.values.issueDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    <CustomInput
                      label="New Expiry Date"
                      required
                      type="date"
                      name="expiryDate"
                      value={formik.values.expiryDate}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={err("expiryDate")}
                    />
                  </Grid>

                  <CustomInput
                    label="Reference Number"
                    name="referenceNumber"
                    value={formik.values.referenceNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="New policy / certificate no."
                  />

                  <CustomTextArea
                    label="Notes"
                    name="notes"
                    rows={2}
                    value={formik.values.notes}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="Notes about this renewal..."
                  />

                  <FileUploadField
                    label="New digital copies"
                    value={formik.values.attachments}
                    uploading={uploading}
                    onChange={(attachments) =>
                      formik.setFieldValue("attachments", attachments)
                    }
                    helperText="Scans of the renewed document (optional). They upload when you renew."
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
                      loadingText={uploading ? "Uploading..." : "Renewing..."}
                    >
                      Renew Document
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
