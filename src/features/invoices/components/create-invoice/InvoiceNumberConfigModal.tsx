import { useMemo } from "react";
import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CustomInput,
  CustomNumberInput,
  CustomSwitch,
} from "@/components/input";
import { formatTransactionSeries } from "@/utils/string-formatter";
import {
  useGetOrganizationTransactionSeries,
  useUpdateOrganizationTransactionSeries,
} from "@/features/settings/api";
import type { UpsertOrgTransactionSeriesPayload } from "@/shared/interface/settings";

interface InvoiceNumberConfigModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the freshly formatted number after the series is saved. */
  onApplyNumber: (invoiceNumber: string) => void;
}

const validationSchema = Yup.object({
  separator: Yup.string().max(3, "Keep it short"),
  padding: Yup.number()
    .typeError("Padding must be a number")
    .min(0)
    .max(20, "Max 20")
    .required("Padding is required"),
  nextNumber: Yup.number()
    .typeError("Next number must be a number")
    .min(1, "Must be at least 1")
    .required("Next number is required"),
});

export function InvoiceNumberConfigModal({
  open,
  onClose,
  onApplyNumber,
}: InvoiceNumberConfigModalProps) {
  const { data } = useGetOrganizationTransactionSeries();
  const invoiceSeries = useMemo(
    () => (data?.data ?? []).find((s) => s.module === "INVOICE"),
    [data?.data],
  );
  const { mutate: updateSeries, isPending } =
    useUpdateOrganizationTransactionSeries();

  const formik = useFormik<UpsertOrgTransactionSeriesPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      module: "INVOICE",
      prefix: invoiceSeries?.prefix ?? "RINV",
      suffix: invoiceSeries?.suffix ?? "",
      separator: invoiceSeries?.separator ?? "-",
      padding: invoiceSeries?.padding ?? 6,
      nextNumber: invoiceSeries?.nextNumber ?? 1,
      autoGenerate: invoiceSeries?.autoGenerate ?? true,
      isActive: invoiceSeries?.isActive ?? true,
    },
    onSubmit: (values) => {
      updateSeries(
        { module: "INVOICE", payload: values },
        {
          onSuccess: () => {
            if (values.autoGenerate) {
              onApplyNumber(
                formatTransactionSeries({
                  prefix: values.prefix,
                  suffix: values.suffix,
                  separator: values.separator,
                  padding: Number(values.padding) || 0,
                  number: Number(values.nextNumber) || 1,
                }),
              );
            }
            onClose();
          },
        },
      );
    },
  });

  const { values } = formik;
  const preview = formatTransactionSeries({
    prefix: values.prefix,
    suffix: values.suffix,
    separator: values.separator,
    padding: Number(values.padding) || 0,
    number: Number(values.nextNumber) || 1,
  });

  const numberField = (
    name: "padding" | "nextNumber",
    label: string,
    min: number,
    max?: number,
  ) => (
    <CustomNumberInput
      label={label}
      precision={0}
      allowNegative={false}
      min={min}
      max={max}
      name={name}
      value={values[name]}
      onValueChange={(_str, num) => formik.setFieldValue(name, num ?? "")}
      error={formik.touched[name] ? (formik.errors[name] as string) : undefined}
    />
  );

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="480px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                Configure Invoice Number Preferences
              </Dialog.Title>
            </Dialog.Header>

            <form onSubmit={formik.handleSubmit}>
              <Dialog.Body py="5">
                <Stack gap="4">
                  <Text fontSize="13px" color="gray.400" lineHeight="1.6">
                    Set how invoice numbers are generated. These preferences are
                    saved to your organization and used across all invoices.
                  </Text>

                  <Grid
                    templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }}
                    gap="4"
                  >
                    <CustomInput
                      label="Prefix"
                      placeholder="RINV"
                      name="prefix"
                      value={values.prefix}
                      onChange={formik.handleChange}
                    />
                    <CustomInput
                      label="Suffix"
                      placeholder="2026"
                      name="suffix"
                      value={values.suffix}
                      onChange={formik.handleChange}
                    />
                    <CustomInput
                      label="Separator"
                      placeholder="-"
                      name="separator"
                      value={values.separator}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.separator
                          ? (formik.errors.separator as string)
                          : undefined
                      }
                    />
                    {numberField("padding", "Padding (digits)", 0, 20)}
                    {numberField("nextNumber", "Next Number", 1)}
                  </Grid>

                  <Box
                    bg="gray.50"
                    p="4"
                    rounded="md"
                    borderWidth="1px"
                    borderColor="gray.75"
                  >
                    <Text
                      fontSize="11px"
                      color="gray.300"
                      mb="1"
                      textTransform="uppercase"
                    >
                      Preview
                    </Text>
                    <Text
                      fontWeight="600"
                      color="gray.500"
                      fontSize="18px"
                      letterSpacing="0.5px"
                    >
                      {preview || "—"}
                    </Text>
                  </Box>

                  <Flex gap="6" wrap="wrap">
                    <CustomSwitch
                      reversed
                      checked={values.autoGenerate}
                      onCheckedChange={(e: { checked: boolean }) =>
                        formik.setFieldValue("autoGenerate", e.checked)
                      }
                    >
                      Auto-generate
                    </CustomSwitch>
                    <CustomSwitch
                      reversed
                      checked={values.isActive}
                      onCheckedChange={(e: { checked: boolean }) =>
                        formik.setFieldValue("isActive", e.checked)
                      }
                    >
                      Active
                    </CustomSwitch>
                  </Flex>
                </Stack>
              </Dialog.Body>

              <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
                <Flex gap="3" justify="flex-end">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    loading={isPending}
                    loadingText="Saving..."
                  >
                    Save
                  </Button>
                </Flex>
              </Dialog.Footer>
            </form>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
