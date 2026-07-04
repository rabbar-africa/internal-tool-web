import { useFormik } from "formik";
import * as Yup from "yup";
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
import { useRenewPaperworkMutation } from "../api/query";
import { formatDate, formatDocumentType } from "../utils/paperwork";
import { FileUploadField } from "./FileUploadField";

interface RenewPaperworkModalProps {
  open: boolean;
  onClose: () => void;
  paperwork: IPaperwork;
}

const validationSchema = Yup.object({
  expiryDate: Yup.string().required("New expiry date is required"),
});

export function RenewPaperworkModal({
  open,
  onClose,
  paperwork,
}: RenewPaperworkModalProps) {
  const { mutateAsync: renew, isPending } = useRenewPaperworkMutation(
    paperwork.id,
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      issueDate: "",
      expiryDate: "",
      referenceNumber: paperwork.referenceNumber ?? "",
      issuer: paperwork.issuer ?? "",
      notes: "",
      fileUrl: "",
      fileName: "",
      fileType: "",
      fileSize: undefined as number | undefined,
    },
    validationSchema,
    onSubmit: async (values) => {
      await renew({
        expiryDate: values.expiryDate,
        ...(values.issueDate ? { issueDate: values.issueDate } : {}),
        ...(values.referenceNumber
          ? { referenceNumber: values.referenceNumber }
          : {}),
        ...(values.issuer ? { issuer: values.issuer } : {}),
        ...(values.notes ? { notes: values.notes } : {}),
        ...(values.fileUrl
          ? {
              fileUrl: values.fileUrl,
              fileName: values.fileName || undefined,
              fileType: values.fileType || undefined,
              fileSize: values.fileSize,
            }
          : {}),
      });
      onClose();
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

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
                      error={
                        formik.touched.expiryDate && formik.errors.expiryDate
                          ? formik.errors.expiryDate
                          : undefined
                      }
                    />
                  </Grid>

                  <Grid templateColumns="1fr 1fr" gap="4">
                    <CustomInput
                      label="Reference Number"
                      name="referenceNumber"
                      value={formik.values.referenceNumber}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="New policy / certificate no."
                    />
                    <CustomInput
                      label="Issuer"
                      name="issuer"
                      value={formik.values.issuer}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </Grid>

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
                    label="New digital copy"
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
                    helperText="Upload the renewed document (optional)."
                  />

                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleClose}
                      disabled={isPending}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      loading={isPending}
                      loadingText="Renewing..."
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
