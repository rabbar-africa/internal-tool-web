import { useMemo } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomSwitch } from "@/components/input/CustomSwitch";
import { InvoicePdfView } from "@/features/invoices/components/invoice-detail/InvoicePdfView";
import { useInvoicePdf } from "@/features/invoices/hooks/useInvoicePdf";
import {
  DEFAULT_INVOICE_DESIGN,
  INVOICE_FONTS,
  INVOICE_LAYOUTS,
  MAX_INVOICE_LABEL_LENGTH,
  type InvoiceDesign,
} from "@/features/invoices/utils/invoice-design";
import { RouteConstants } from "@/shared/constants/routes";
import { SettingsSubPage } from "../SettingsSubPage";
import {
  useCreateInvoiceTemplate,
  useGetOrganizationTemplates,
  useUpdateOrganizationTemplate,
} from "../../api";
import { LAYOUT_DETAILS } from "./layoutDetails";
import { SAMPLE_INVOICE } from "./sampleInvoice";

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

const FONT_OPTIONS: { label: string; value: InvoiceDesign["style"]["font"] }[] =
  INVOICE_FONTS.map((font) => ({
    label: font === "Times-Roman" ? "Times New Roman" : font,
    value: font,
  }));

const SHOW_FIELDS: { key: keyof InvoiceDesign["show"]; label: string }[] = [
  { key: "logo", label: "Logo" },
  { key: "rcNumber", label: "RC number" },
  { key: "orgAddress", label: "Business address" },
  { key: "orgContact", label: "Email, phone & website" },
  { key: "billingAddress", label: "Customer address" },
  { key: "paymentTerms", label: "Payment terms" },
  { key: "dueDate", label: "Due date" },
  { key: "itemDescription", label: "Item descriptions" },
  { key: "vehicle", label: "Vehicle information" },
  { key: "bankDetails", label: "Account details" },
  { key: "notes", label: "Notes" },
  { key: "terms", label: "Terms & conditions" },
];

const LABEL_FIELDS: { key: keyof InvoiceDesign["labels"]; label: string }[] = [
  { key: "title", label: "Document title" },
  { key: "billTo", label: "Bill to" },
  { key: "invoiceDate", label: "Invoice date" },
  { key: "paymentTerms", label: "Payment terms" },
  { key: "dueDate", label: "Due date" },
  { key: "balanceDue", label: "Balance due" },
  { key: "items", label: "Items column" },
  { key: "quantity", label: "Quantity column" },
  { key: "rate", label: "Rate column" },
  { key: "amount", label: "Amount column" },
  { key: "vehicle", label: "Vehicle section" },
  { key: "bank", label: "Account section" },
  { key: "notes", label: "Notes section" },
  { key: "terms", label: "Terms section" },
];

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Give this template a name")
    .max(60, "Keep the name under 60 characters"),
  design: Yup.object({
    style: Yup.object({
      primaryColor: Yup.string().matches(
        HEX_COLOR,
        "Use a colour like #012751",
      ),
      headerColor: Yup.string().matches(HEX_COLOR, "Use a colour like #1a1a2e"),
    }),
    labels: Yup.object(
      Object.fromEntries(
        LABEL_FIELDS.map(({ key }) => [
          key,
          Yup.string()
            .trim()
            .required("Can't be empty")
            .max(MAX_INVOICE_LABEL_LENGTH, "Too long"),
        ]),
      ),
    ),
  }),
});

interface EditorValues {
  name: string;
  design: InvoiceDesign;
}

function EditorSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box borderWidth="1px" borderColor="gray.75" rounded="lg" p="4" bg="white">
      <Text fontSize="13px" fontWeight="700" color="gray.500" mb="3">
        {title}
      </Text>
      {children}
    </Box>
  );
}

function ColorField({
  label,
  value,
  error,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Flex gap="2" align="flex-end">
      <Input
        type="color"
        aria-label={`${label} picker`}
        value={HEX_COLOR.test(value) ? value : "#000000"}
        onChange={(event) => onChange(event.target.value)}
        w="12"
        h="10"
        p="1"
        flexShrink={0}
        cursor="pointer"
      />
      <CustomInput
        label={label}
        value={value}
        error={error}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
      />
    </Flex>
  );
}

export function InvoiceTemplateEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetOrganizationTemplates({ enabled: !!id });
  const existing = id ? data?.data?.find((row) => row.id === id) : undefined;
  const { mutateAsync: createTemplate, isPending: isCreating } =
    useCreateInvoiceTemplate();
  const { mutateAsync: updateTemplate, isPending: isUpdating } =
    useUpdateOrganizationTemplate();
  const { open: openPdf, isGenerating } = useInvoicePdf();

  const backToList = () =>
    navigate(RouteConstants.settings.invoiceTemplates.path);

  const formik = useFormik<EditorValues>({
    enableReinitialize: true,
    initialValues: {
      name: existing?.name ?? "",
      design: existing?.design ?? DEFAULT_INVOICE_DESIGN,
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = { name: values.name.trim(), design: values.design };
      if (id) await updateTemplate({ id, payload });
      else await createTemplate(payload);
      backToList();
    },
  });

  const { design } = formik.values;
  const previewInvoice = useMemo(
    () => ({ ...SAMPLE_INVOICE, design }),
    [design],
  );
  const designErrors = formik.errors.design as
    | {
        style?: { primaryColor?: string; headerColor?: string };
        labels?: Partial<Record<keyof InvoiceDesign["labels"], string>>;
      }
    | undefined;

  if (id && isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.300" />
      </Center>
    );
  }
  if (id && !existing) {
    return (
      <Center py="20">
        <Text color="gray.400">Template not found.</Text>
      </Center>
    );
  }

  return (
    <SettingsSubPage
      title={id ? "Edit Template" : "New Template"}
      subtitle="Changes show in the preview straight away. The numbers are only an example."
    >
      <form onSubmit={formik.handleSubmit}>
        <Grid
          templateColumns={{ base: "1fr", xl: "380px 1fr" }}
          gap="6"
          alignItems="start"
        >
          <Stack gap="4">
            <EditorSection title="Name">
              <CustomInput
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="e.g. Blue branded"
                error={formik.touched.name ? formik.errors.name : undefined}
              />
            </EditorSection>

            <EditorSection title="Layout">
              <Stack gap="2" role="radiogroup" aria-label="Layout">
                {INVOICE_LAYOUTS.map((layout) => {
                  const isSelected = design.layout === layout;
                  return (
                    <Box
                      key={layout}
                      as="button"
                      role="radio"
                      aria-checked={isSelected}
                      textAlign="left"
                      p="3"
                      rounded="md"
                      borderWidth="1px"
                      borderColor={isSelected ? "primary.300" : "gray.75"}
                      bg={isSelected ? "primary.50" : "white"}
                      onClick={(event: React.MouseEvent) => {
                        event.preventDefault();
                        formik.setFieldValue("design.layout", layout);
                      }}
                    >
                      <Text fontSize="13px" fontWeight="600" color="gray.500">
                        {LAYOUT_DETAILS[layout].label}
                      </Text>
                      <Text fontSize="12px" color="gray.400">
                        {LAYOUT_DETAILS[layout].description}
                      </Text>
                    </Box>
                  );
                })}
              </Stack>
            </EditorSection>

            <EditorSection title="Colours & font">
              <Stack gap="3">
                <ColorField
                  label="Main colour"
                  value={design.style.primaryColor}
                  error={designErrors?.style?.primaryColor}
                  onChange={(value) =>
                    formik.setFieldValue("design.style.primaryColor", value)
                  }
                />
                <ColorField
                  label="Header colour"
                  value={design.style.headerColor}
                  error={designErrors?.style?.headerColor}
                  onChange={(value) =>
                    formik.setFieldValue("design.style.headerColor", value)
                  }
                />
                <CustomSelect
                  label="Font"
                  options={FONT_OPTIONS}
                  value={[design.style.font]}
                  onChange={(option: { value: string[] }) => {
                    const font = option?.value?.[0];
                    if (font) formik.setFieldValue("design.style.font", font);
                  }}
                />
              </Stack>
            </EditorSection>

            <EditorSection title="Show on the invoice">
              <Text fontSize="12px" color="gray.400" mb="3">
                The invoice number, customer, date, items, tax, and totals
                always appear.
              </Text>
              <Stack gap="3">
                {SHOW_FIELDS.map(({ key, label }) => (
                  <CustomSwitch
                    key={key}
                    label={label}
                    rootProps={{
                      checked: design.show[key],
                      onCheckedChange: ({ checked }: { checked: boolean }) =>
                        formik.setFieldValue(`design.show.${key}`, checked),
                    }}
                  />
                ))}
              </Stack>
            </EditorSection>

            <EditorSection title="Rename labels">
              <Stack gap="3">
                {LABEL_FIELDS.map(({ key, label }) => (
                  <CustomInput
                    key={key}
                    label={label}
                    name={`design.labels.${key}`}
                    value={design.labels[key]}
                    onChange={formik.handleChange}
                    error={designErrors?.labels?.[key]}
                  />
                ))}
              </Stack>
            </EditorSection>

            <Flex gap="2" flexWrap="wrap">
              <Button
                type="submit"
                variant="primary"
                loading={isCreating || isUpdating}
              >
                Save template
              </Button>
              <Button
                type="button"
                variant="outline"
                loading={isGenerating}
                onClick={() => void openPdf(previewInvoice)}
              >
                Preview PDF
              </Button>
              <Button type="button" variant="ghost" onClick={backToList}>
                Cancel
              </Button>
            </Flex>
          </Stack>

          <Box position={{ xl: "sticky" }} top={{ xl: "4" }} minW="0">
            <InvoicePdfView invoice={previewInvoice} isPreview />
          </Box>
        </Grid>
      </form>
    </SettingsSubPage>
  );
}
