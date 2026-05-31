import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import {
  CustomCheckbox,
  CustomInput,
  CustomNumberInput,
  CustomSelect,
  CustomSwitch,
  CustomTextArea,
} from "@/components/input";
import {
  DATE_FORMAT_OPTIONS,
  FISCAL_YEAR_MONTHS,
  NUMBER_FORMAT_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  TIME_FORMAT_OPTIONS,
  type UpdateOrgConfigPayload,
} from "@/shared/interface/settings";
import { SettingsSubPage } from "../SettingsSubPage";
import {
  useGetOrganizationDetails,
  useUpdateOrganizationConfig,
} from "../../api";

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

function SectionLabel({ children }: { children: string }) {
  return (
    <Text
      fontSize="13px"
      fontWeight="700"
      color="gray.400"
      mt="2"
      gridColumn={{ base: "1", md: "1 / -1" }}
    >
      {children}
    </Text>
  );
}

export function GeneralConfig() {
  const { data, isLoading } = useGetOrganizationDetails();
  const config = data?.data?.config;

  const { mutate: updateConfig, isPending } = useUpdateOrganizationConfig();

  const formik = useFormik<UpdateOrgConfigPayload>({
    enableReinitialize: true,
    initialValues: {
      fiscalYearStartMonth: config?.fiscalYearStartMonth ?? 1,
      dateFormat: config?.dateFormat ?? "DD/MM/YYYY",
      timeFormat: config?.timeFormat ?? "HH:mm",
      decimalPlaces: config?.decimalPlaces ?? 2,
      numberFormat: config?.numberFormat ?? "1,234,567.89",
      isInclusiveTaxDefault: config?.isInclusiveTaxDefault ?? false,
      isDiscountBeforeTaxDefault: config?.isDiscountBeforeTaxDefault ?? false,
      defaultPaymentTerms: config?.defaultPaymentTerms ?? 0,
      allowNegativeStock: config?.allowNegativeStock ?? false,
      requireSignatureOnInspection:
        config?.requireSignatureOnInspection ?? false,
      allowedPaymentMethods: config?.allowedPaymentMethods ?? [],
      brandPrimaryColor: config?.brandPrimaryColor ?? "#000000",
      brandSecondaryColor: config?.brandSecondaryColor ?? "#ffffff",
      brandFont: config?.brandFont ?? "",
      invoiceFooter: config?.invoiceFooter ?? "",
      invoiceNotesDefault: config?.invoiceNotesDefault ?? "",
      invoiceTermsDefault: config?.invoiceTermsDefault ?? "",
    },
    onSubmit: (values) => {
      updateConfig(values);
    },
  });

  const { values } = formik;

  const togglePaymentMethod = (method: string, checked: boolean) => {
    const next = checked
      ? [...values.allowedPaymentMethods, method]
      : values.allowedPaymentMethods.filter((m) => m !== method);
    formik.setFieldValue("allowedPaymentMethods", next);
  };

  return (
    <SettingsSubPage
      title="General Configuration"
      subtitle="Organization-wide defaults for formatting, finance, branding, and inspections."
    >
      {isLoading ? (
        <Center py="12">
          <Spinner color="primary.300" />
        </Center>
      ) : (
        <form onSubmit={formik.handleSubmit}>
          <Grid
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap="4"
            alignItems="start"
          >
            {/* ── Localization & formatting ── */}
            <SectionLabel>Localization & formatting</SectionLabel>

            <CustomSelect
              label="Fiscal year start month"
              options={FISCAL_YEAR_MONTHS.map((m) => ({
                label: m.label,
                value: String(m.value),
              }))}
              value={[String(values.fiscalYearStartMonth)]}
              onChange={(opt: any) =>
                formik.setFieldValue(
                  "fiscalYearStartMonth",
                  Number(opt?.value?.[0]),
                )
              }
            />
            <CustomSelect
              label="Date format"
              options={DATE_FORMAT_OPTIONS}
              value={[values.dateFormat]}
              onChange={(opt: any) =>
                formik.setFieldValue("dateFormat", opt?.value?.[0])
              }
            />
            <CustomSelect
              label="Time format"
              options={TIME_FORMAT_OPTIONS}
              value={[values.timeFormat]}
              onChange={(opt: any) =>
                formik.setFieldValue("timeFormat", opt?.value?.[0])
              }
            />
            <CustomSelect
              label="Number format"
              options={NUMBER_FORMAT_OPTIONS}
              value={[values.numberFormat]}
              onChange={(opt: any) =>
                formik.setFieldValue("numberFormat", opt?.value?.[0])
              }
            />
            <CustomNumberInput
              label="Decimal places"
              precision={0}
              allowNegative={false}
              min={0}
              max={8}
              name="decimalPlaces"
              value={values.decimalPlaces}
              onValueChange={(_str, num) =>
                formik.setFieldValue("decimalPlaces", num ?? 0)
              }
            />

            {/* ── Finance defaults ── */}
            <SectionLabel>Finance defaults</SectionLabel>

            <CustomNumberInput
              label="Default payment terms (days)"
              precision={0}
              allowNegative={false}
              min={0}
              name="defaultPaymentTerms"
              value={values.defaultPaymentTerms}
              onValueChange={(_str, num) =>
                formik.setFieldValue("defaultPaymentTerms", num ?? 0)
              }
            />

            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
              <Text textStyle="tiny-semibold" color="gray.300" mb="2.5">
                Allowed payment methods
              </Text>
              <Flex gap="5" wrap="wrap">
                {PAYMENT_METHOD_OPTIONS.map((method) => (
                  <CustomCheckbox
                    key={method}
                    label={titleCase(method)}
                    checked={values.allowedPaymentMethods.includes(method)}
                    onCheckedChange={(e: { checked: boolean }) =>
                      togglePaymentMethod(method, e.checked)
                    }
                  />
                ))}
              </Flex>
            </Box>

            <Flex gridColumn={{ base: "1", md: "1 / -1" }} gap="6" wrap="wrap">
              <CustomSwitch
                reversed
                checked={values.isInclusiveTaxDefault}
                onCheckedChange={(e: { checked: boolean }) =>
                  formik.setFieldValue("isInclusiveTaxDefault", e.checked)
                }
              >
                Tax inclusive by default
              </CustomSwitch>
              <CustomSwitch
                reversed
                checked={values.isDiscountBeforeTaxDefault}
                onCheckedChange={(e: { checked: boolean }) =>
                  formik.setFieldValue("isDiscountBeforeTaxDefault", e.checked)
                }
              >
                Apply discount before tax
              </CustomSwitch>
              <CustomSwitch
                reversed
                checked={values.allowNegativeStock}
                onCheckedChange={(e: { checked: boolean }) =>
                  formik.setFieldValue("allowNegativeStock", e.checked)
                }
              >
                Allow negative stock
              </CustomSwitch>
              <CustomSwitch
                reversed
                checked={values.requireSignatureOnInspection}
                onCheckedChange={(e: { checked: boolean }) =>
                  formik.setFieldValue(
                    "requireSignatureOnInspection",
                    e.checked,
                  )
                }
              >
                Require signature on inspection
              </CustomSwitch>
            </Flex>

            {/* ── Branding ── */}
            <SectionLabel>Branding</SectionLabel>

            <CustomInput
              label="Primary color"
              inputProps={{ type: "color" }}
              name="brandPrimaryColor"
              value={values.brandPrimaryColor}
              onChange={formik.handleChange}
            />
            <CustomInput
              label="Secondary color"
              inputProps={{ type: "color" }}
              name="brandSecondaryColor"
              value={values.brandSecondaryColor}
              onChange={formik.handleChange}
            />
            <CustomInput
              label="Brand font"
              placeholder="e.g. Inter, Roboto"
              name="brandFont"
              value={values.brandFont ?? ""}
              onChange={formik.handleChange}
            />

            {/* ── Invoice defaults ── */}
            <SectionLabel>Invoice defaults</SectionLabel>

            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
              <CustomTextArea
                label="Invoice footer"
                placeholder="Text shown at the bottom of every invoice"
                name="invoiceFooter"
                rows={2}
                value={values.invoiceFooter ?? ""}
                onChange={formik.handleChange}
              />
            </Box>
            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
              <CustomTextArea
                label="Default invoice notes"
                placeholder="Default notes prefilled on new invoices"
                name="invoiceNotesDefault"
                rows={2}
                value={values.invoiceNotesDefault ?? ""}
                onChange={formik.handleChange}
              />
            </Box>
            <Box gridColumn={{ base: "1", md: "1 / -1" }}>
              <CustomTextArea
                label="Default invoice terms"
                placeholder="Default terms & conditions prefilled on new invoices"
                name="invoiceTermsDefault"
                rows={2}
                value={values.invoiceTermsDefault ?? ""}
                onChange={formik.handleChange}
              />
            </Box>
          </Grid>

          <Flex justify="flex-end" mt="6">
            <Button
              type="submit"
              size="sm"
              loading={isPending}
              alignSelf={{ base: "stretch", sm: "auto" }}
            >
              Save changes
            </Button>
          </Flex>
        </form>
      )}
    </SettingsSubPage>
  );
}
