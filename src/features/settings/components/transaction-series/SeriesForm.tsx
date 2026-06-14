import { Box, Button, Flex, Grid, Stack, Text } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  CustomInput,
  CustomNumberInput,
  CustomSwitch,
} from "@/components/input";
import { formatTransactionSeries } from "@/utils/string-formatter";
import type {
  IOrgTransactionSeries,
  TxnSeriesModule,
  UpsertOrgTransactionSeriesPayload,
} from "@/shared/interface/settings";
import { useUpdateOrganizationTransactionSeries } from "../../api";

interface SeriesFormProps {
  module: TxnSeriesModule;
  series?: IOrgTransactionSeries;
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

export function SeriesForm({ module, series }: SeriesFormProps) {
  const { mutate: updateSeries, isPending } =
    useUpdateOrganizationTransactionSeries();

  const formik = useFormik<UpsertOrgTransactionSeriesPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      module,
      prefix: series?.prefix ?? "",
      suffix: series?.suffix ?? "",
      separator: series?.separator ?? "-",
      padding: series?.padding ?? 6,
      nextNumber: series?.nextNumber ?? 1,
      autoGenerate: series?.autoGenerate ?? true,
      isActive: series?.isActive ?? true,
    },
    onSubmit: (values) => {
      updateSeries({ module, payload: values });
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
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="4" pt="4">
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "repeat(3, 1fr)" }}
          gap="4"
        >
          <CustomInput
            label="Prefix"
            placeholder="INV"
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

        <Flex
          align={{ base: "flex-start", sm: "center" }}
          justify="space-between"
          gap="4"
          direction={{ base: "column", sm: "row" }}
        >
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
          <Button
            type="submit"
            size="sm"
            loading={isPending}
            alignSelf={{ base: "stretch", sm: "auto" }}
          >
            Save
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
