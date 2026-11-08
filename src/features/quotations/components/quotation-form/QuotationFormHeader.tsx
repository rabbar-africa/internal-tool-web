import { useMemo } from "react";
import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import type { CreateInvoiceFormValues } from "@/shared/interface/invoice";
import {
  addDays,
  dueDateAfterDateChange,
} from "@/features/invoices/utils/payment-terms";
import {
  CustomerVehicleSection,
  type CustomerVehicleSectionProps,
} from "@/features/invoices/components/create-invoice/CustomerVehicleSection";
import {
  useGetOrganizationTemplates,
  useGetOrganizationTransactionSeries,
} from "@/features/settings/api";

/** A select can't hold an empty value, so "use the default" needs a name. */
const ORG_DEFAULT_TEMPLATE = "organization-default";

/** Quick picks for "Valid until", in days from the quote date. */
const VALIDITY_PICKS = [7, 14, 30];

type QuotationFormHeaderProps = CustomerVehicleSectionProps & {
  formik: FormikProps<CreateInvoiceFormValues>;
};

/**
 * The quote's header. `formik.values.dueDate` holds "Valid until", and ""
 * means the quote never expires. No payment terms or bank account: a quote
 * asks for no money.
 */
export function QuotationFormHeader(props: QuotationFormHeaderProps) {
  const { formik } = props;
  const { date, dueDate } = formik.values;

  const { data: templatesData } = useGetOrganizationTemplates();
  const templateOptions = useMemo(() => {
    const templates = (templatesData?.data ?? []).filter(
      (template) => template.module === "ESTIMATE",
    );
    return templates.length === 0
      ? []
      : [
          { label: "Organization default", value: ORG_DEFAULT_TEMPLATE },
          ...templates.map((template) => ({
            label: template.name,
            value: template.id,
          })),
        ];
  }, [templatesData]);

  const { data: txnSeriesData } = useGetOrganizationTransactionSeries();
  const isAutoNumber = useMemo(
    () =>
      (txnSeriesData?.data ?? []).find((s) => s.module === "ESTIMATE")
        ?.autoGenerate ?? true,
    [txnSeriesData?.data],
  );

  const pickValidity = (days: number | null) =>
    formik.setFieldValue(
      "dueDate",
      days === null ? "" : (addDays(date, days) ?? ""),
    );
  const activePick = !dueDate
    ? null
    : (VALIDITY_PICKS.find((days) => addDays(date, days) === dueDate) ??
      undefined);

  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={{ base: "6", md: "10" }}
      p={{ base: "4", md: "6" }}
    >
      <CustomerVehicleSection {...props} />

      <Stack gap="4">
        <CustomInput
          label="Quote #"
          required
          placeholder="e.g. EST-000001"
          name="invoiceNumber"
          value={formik.values.invoiceNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={isAutoNumber}
          helperText={
            isAutoNumber
              ? "Numbered automatically (Settings → Auto Numbering)"
              : undefined
          }
          error={
            (formik.touched.invoiceNumber || formik.submitCount > 0) &&
            formik.errors.invoiceNumber
              ? String(formik.errors.invoiceNumber)
              : undefined
          }
        />

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
          <CustomInput
            label="Quote Date"
            type="date"
            required
            name="date"
            value={date}
            onChange={(e) => {
              // Keep the same validity, unless it never expires.
              if (dueDate) {
                formik.setFieldValue(
                  "dueDate",
                  dueDateAfterDateChange(date, e.target.value, dueDate),
                );
              }
              formik.handleChange(e);
            }}
            onBlur={formik.handleBlur}
            error={
              formik.touched.date && formik.errors.date
                ? String(formik.errors.date)
                : undefined
            }
          />
          <CustomInput
            label="Valid Until"
            type="date"
            name="dueDate"
            value={dueDate}
            placeholder="No expiry"
            inputProps={{ min: date }}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>

        <Box>
          <Flex gap="2" wrap="wrap">
            {VALIDITY_PICKS.map((days) => (
              <Button
                key={days}
                size="xs"
                variant={activePick === days ? "solid" : "outline"}
                onClick={() => pickValidity(days)}
              >
                {days} days
              </Button>
            ))}
            <Button
              size="xs"
              variant={activePick === null ? "solid" : "outline"}
              onClick={() => pickValidity(null)}
            >
              No expiry
            </Button>
          </Flex>
          <Text fontSize="12px" color="gray.300" mt="1.5">
            {dueDate
              ? "After this date the quote shows as Expired. It can still be accepted."
              : "This quote never expires."}
          </Text>
        </Box>

        <CustomInput
          label="Reference"
          placeholder="e.g. the customer's PO number (optional)"
          name="referenceNumber"
          value={formik.values.referenceNumber}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />

        {templateOptions.length > 1 ? (
          <CustomSelect
            label="Template"
            options={templateOptions}
            value={[formik.values.templateId || ORG_DEFAULT_TEMPLATE]}
            onChange={(opt: { value: string[] }) => {
              const templateId = opt?.value?.[0];
              formik.setFieldValue(
                "templateId",
                templateId === ORG_DEFAULT_TEMPLATE ? "" : (templateId ?? ""),
              );
            }}
            helperText="How this quote looks"
          />
        ) : null}
      </Stack>
    </Grid>
  );
}
