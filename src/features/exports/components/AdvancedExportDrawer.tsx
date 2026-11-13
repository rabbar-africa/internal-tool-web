import { useMemo, useState } from "react";
import {
  Box,
  Button,
  CloseButton,
  Drawer,
  Flex,
  Grid,
  Portal,
  RadioGroup,
  Separator,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { CustomInput } from "@/components/input/CustomInput";
import { DateField } from "@/components/input/DateField";
import { EyeIcon, EyeOff, InfoIcon } from "@/assets/custom";
import type {
  CreateExportPayload,
  ExportCatalog,
  ExportFileFormat,
  ExportModule,
  ExportModuleKey,
  ExportScope,
} from "@/shared/interface/export";
import { useCreateExportMutation } from "../api";
import { announceExport } from "../utils/announce-export";

// The backend's rule; it says why in `catalog.passwordRule`.
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{12,128}$/;

interface ExportFormValues {
  module: string;
  variant: string;
  range: "all" | "period";
  from: string;
  to: string;
  /** Enum filters by key; "" is any. */
  filters: Record<string, string>;
  /** Narrow to the page's scope, e.g. this customer. */
  useScope: boolean;
  decimalFormat: string;
  fileFormat: ExportFileFormat;
  includePii: boolean;
  /** Extra tabs ticked, by key; only sent for XLS/XLSX. */
  extraSheets: string[];
  password: string;
}

/** "PARTIALLY_PAID" → "Partially paid". */
const humanize = (value: string) => {
  const words = value.replace(/_/g, " ").toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
};

const scopeFor = (scope: ExportScope | undefined, moduleKey: string) =>
  scope?.filters[moduleKey as ExportModuleKey];

interface RadioListProps {
  value: string;
  onChange: (value: string) => void;
  items: Array<{ value: string; label: string }>;
}

function RadioList({ value, onChange, items }: RadioListProps) {
  return (
    <RadioGroup.Root
      value={value}
      onValueChange={(e) => e.value && onChange(e.value)}
      variant="outline"
    >
      <Stack gap="3">
        {items.map((item) => (
          <RadioGroup.Item key={item.value} value={item.value}>
            <RadioGroup.ItemHiddenInput />
            <RadioGroup.ItemIndicator
              _checked={{ color: "primary", borderColor: "primary" }}
            />
            <RadioGroup.ItemText textStyle="small-regular" color="gray.500">
              {item.label}
            </RadioGroup.ItemText>
          </RadioGroup.Item>
        ))}
      </Stack>
    </RadioGroup.Root>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text textStyle="tiny-semibold" color="gray.300" mb="2.5">
      {children}
    </Text>
  );
}

interface ExportFormProps {
  catalog: ExportCatalog;
  initialModule: string;
  scope?: ExportScope;
  onDone: () => void;
}

/** Lives inside the drawer so closing it starts the next export afresh. */
function ExportForm({
  catalog,
  initialModule,
  scope,
  onDone,
}: ExportFormProps) {
  const { mutateAsync: createExport, isPending } = useCreateExportMutation();
  const [showPassword, setShowPassword] = useState(false);

  const firstModule =
    catalog.modules.find((m) => m.key === initialModule) ?? catalog.modules[0];

  const formik = useFormik<ExportFormValues>({
    initialValues: {
      module: firstModule.key,
      variant: firstModule.variants[0]?.key ?? "",
      range: "all",
      from: "",
      to: "",
      filters: {},
      useScope: Boolean(scopeFor(scope, firstModule.key)),
      decimalFormat: catalog.defaultDecimalFormat,
      fileFormat: catalog.fileFormats[0]?.key ?? "csv",
      includePii: false,
      extraSheets: [],
      password: "",
    },
    validationSchema: Yup.object({
      from: Yup.string().when("range", {
        is: "period",
        then: (s) => s.required("Pick a start date"),
      }),
      to: Yup.string().when("range", {
        is: "period",
        then: (s) =>
          s
            .required("Pick an end date")
            .test(
              "after-from",
              "The end date is before the start date",
              (to, ctx) => !to || !ctx.parent.from || to >= ctx.parent.from,
            ),
      }),
      password: Yup.string().matches(PASSWORD_PATTERN, {
        message: catalog.passwordRule,
        excludeEmptyString: true,
      }),
    }),
    onSubmit: async (values) => {
      const moduleScope = values.useScope
        ? scopeFor(scope, values.module)
        : undefined;
      const filters = Object.fromEntries(
        Object.entries({ ...values.filters, ...moduleScope }).filter(
          ([, value]) => value,
        ),
      );
      const payload: CreateExportPayload = {
        module: values.module,
        variant: values.variant,
        ...(values.range === "period"
          ? { from: values.from, to: values.to }
          : {}),
        filters,
        decimalFormat: values.decimalFormat,
        fileFormat: values.fileFormat,
        includePii: values.includePii,
        // A CSV has no tabs, so the API refuses extra sheets on one.
        ...(values.fileFormat !== "csv" && values.extraSheets.length
          ? { extraSheets: values.extraSheets }
          : {}),
        ...(values.password ? { password: values.password } : {}),
      };

      announceExport(await createExport(payload));
      onDone();
    },
  });

  const { values, errors, touched, setFieldValue } = formik;
  const module: ExportModule =
    catalog.modules.find((m) => m.key === values.module) ?? firstModule;
  const variant =
    module.variants.find((v) => v.key === values.variant) ?? module.variants[0];
  const moduleScope = scopeFor(scope, module.key);
  const enumFilters = module.filters.filter(
    (f) => f.type === "enum" && f.options?.length,
  );
  const hasPii = variant?.columns.some((c) => c.pii) ?? false;
  const extraSheets = variant?.extraSheets ?? [];
  const isCsv = values.fileFormat === "csv";
  const fileFormat = catalog.fileFormats.find(
    (f) => f.key === values.fileFormat,
  );

  const moduleOptions = useMemo(
    () => catalog.modules.map((m) => ({ label: m.label, value: m.key })),
    [catalog.modules],
  );

  const changeModule = (key: string) => {
    const next = catalog.modules.find((m) => m.key === key);
    if (!next) return;
    // What fits one module rarely fits another: start its options afresh.
    formik.setValues({
      ...values,
      module: next.key,
      variant: next.variants[0]?.key ?? "",
      range: next.period ? values.range : "all",
      filters: {},
      useScope: Boolean(scopeFor(scope, next.key)),
      includePii: false,
      extraSheets: [],
    });
  };

  return (
    <>
      <Drawer.Header
        bg="gray.25"
        borderBottomWidth="1px"
        borderColor="gray.75"
        py="4"
      >
        <Drawer.Title textStyle="h4-semibold" color="gray.500">
          Export {module.label}
        </Drawer.Title>
      </Drawer.Header>

      <Drawer.Body py="5">
        <Stack gap="6">
          <Flex
            gap="2.5"
            align="center"
            bg="primary.50"
            rounded="lg"
            px="4"
            py="3"
          >
            <InfoIcon boxSize="4" color="primary.300" flexShrink={0} />
            <Text textStyle="small-regular" color="gray.500">
              You can export your data in CSV, XLS or XLSX format.
            </Text>
          </Flex>

          <Box>
            <CustomSelect
              label="Module"
              required
              options={moduleOptions}
              value={[values.module]}
              onChange={(opt: { value: string[] }) => {
                const key = opt?.value?.[0];
                if (key) changeModule(key);
              }}
            />
            {module.variants.length > 1 && (
              <Box mt="4">
                <RadioList
                  value={values.variant}
                  onChange={(value) =>
                    // Each variant offers its own tabs.
                    formik.setValues({
                      ...values,
                      variant: value,
                      extraSheets: [],
                    })
                  }
                  items={module.variants.map((v) => ({
                    value: v.key,
                    label: v.label,
                  }))}
                />
                {variant?.description && (
                  <Text fontSize="12px" color="gray.300" mt="2">
                    {variant.description}
                  </Text>
                )}
              </Box>
            )}
          </Box>

          <Separator borderColor="gray.75" />

          <Box>
            <RadioList
              value={values.range}
              onChange={(value) => setFieldValue("range", value)}
              items={[
                { value: "all", label: `All ${module.label}` },
                ...(module.period
                  ? [{ value: "period", label: "Specific period" }]
                  : []),
              ]}
            />
            {values.range === "period" && module.period && (
              <Stack gap="2" mt="3">
                <Flex gap="2" wrap="wrap">
                  <DateField
                    label="From"
                    value={values.from}
                    max={values.to || undefined}
                    onChange={(value) => setFieldValue("from", value)}
                    containerProps={{ flex: "1", minW: "10rem" }}
                  />
                  <DateField
                    label="To"
                    value={values.to}
                    min={values.from || undefined}
                    onChange={(value) => setFieldValue("to", value)}
                    containerProps={{ flex: "1", minW: "10rem" }}
                  />
                </Flex>
                <Text fontSize="12px" color="gray.300">
                  Filters on {module.period.label.toLowerCase()}.
                </Text>
                {((touched.from && errors.from) ||
                  (touched.to && errors.to)) && (
                  <Text fontSize="12px" color="red.400">
                    {(touched.from && errors.from) || errors.to}
                  </Text>
                )}
              </Stack>
            )}
          </Box>

          {(moduleScope || enumFilters.length > 0) && (
            <Stack gap="4">
              {moduleScope && scope && (
                <CustomCheckbox
                  checked={values.useScope}
                  onCheckedChange={(e: { checked: boolean }) =>
                    setFieldValue("useScope", Boolean(e.checked))
                  }
                  label={`Only for ${scope.label}`}
                />
              )}
              {enumFilters.length > 0 && (
                <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
                  {enumFilters.map((filter) => (
                    <CustomSelect
                      key={filter.key}
                      label={filter.label}
                      options={[
                        { label: "All", value: "" },
                        ...(filter.options ?? []).map((option) => ({
                          label: humanize(option),
                          value: option,
                        })),
                      ]}
                      value={[values.filters[filter.key] ?? ""]}
                      onChange={(opt: { value: string[] }) =>
                        setFieldValue("filters", {
                          ...values.filters,
                          [filter.key]: opt?.value?.[0] ?? "",
                        })
                      }
                    />
                  ))}
                </Grid>
              )}
            </Stack>
          )}

          <Box maxW={{ sm: "20rem" }}>
            <CustomSelect
              label="Decimal format"
              required
              options={catalog.decimalFormats.map((format) => ({
                label: format,
                value: format,
              }))}
              value={[values.decimalFormat]}
              onChange={(opt: { value: string[] }) =>
                setFieldValue(
                  "decimalFormat",
                  opt?.value?.[0] ?? catalog.defaultDecimalFormat,
                )
              }
            />
          </Box>

          <Box>
            <SectionLabel>Export file format</SectionLabel>
            <RadioList
              value={values.fileFormat}
              onChange={(value) => setFieldValue("fileFormat", value)}
              items={catalog.fileFormats.map((format) => ({
                value: format.key,
                label: format.label,
              }))}
            />
          </Box>

          {extraSheets.length > 0 && (
            <Box>
              <SectionLabel>Extra tabs</SectionLabel>
              <Stack gap="3">
                {extraSheets.map((sheet) => (
                  <Box key={sheet.key}>
                    <CustomCheckbox
                      checked={!isCsv && values.extraSheets.includes(sheet.key)}
                      disabled={isCsv}
                      onCheckedChange={(e: { checked: boolean }) =>
                        setFieldValue(
                          "extraSheets",
                          e.checked
                            ? [...values.extraSheets, sheet.key]
                            : values.extraSheets.filter(
                                (key) => key !== sheet.key,
                              ),
                        )
                      }
                      label={`Add a ${sheet.label} tab`}
                    />
                    {sheet.description && (
                      <Text fontSize="12px" color="gray.300" mt="1" pl="6">
                        {sheet.description}
                      </Text>
                    )}
                  </Box>
                ))}
                {isCsv && (
                  <Text fontSize="12px" color="gray.400">
                    A CSV file has no tabs. Choose XLS or XLSX to add them.
                  </Text>
                )}
              </Stack>
            </Box>
          )}

          {hasPii && (
            <CustomCheckbox
              checked={values.includePii}
              onCheckedChange={(e: { checked: boolean }) =>
                setFieldValue("includePii", Boolean(e.checked))
              }
              label="Include sensitive personal information (email, phone, address)"
            />
          )}

          <Box maxW={{ sm: "20rem" }}>
            <CustomInput
              label="File protection password"
              placeholder="Optional"
              type={showPassword ? "text" : "password"}
              helperText={catalog.passwordRule}
              error={touched.password ? errors.password : undefined}
              inputProps={{
                name: "password",
                autoComplete: "new-password",
                value: values.password,
                onChange: formik.handleChange,
                onBlur: formik.handleBlur,
              }}
              rightElement={
                <chakra.button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((prev) => !prev)}
                  display="flex"
                >
                  {showPassword ? (
                    <EyeIcon w=".875rem" color="gray.300" />
                  ) : (
                    <EyeOff w=".875rem" color="gray.300" />
                  )}
                </chakra.button>
              }
            />
            {values.password && fileFormat?.passwordProtection === "zip" && (
              <Text fontSize="12px" color="gray.400" mt="2">
                CSV and XLS files come inside a password-protected ZIP. On
                Windows, open it with 7-Zip or WinRAR.
              </Text>
            )}
          </Box>

          <Text textStyle="small-regular" color="gray.400">
            <Text as="span" color="gray.500" fontWeight="600">
              Note:{" "}
            </Text>
            You can export only the first {catalog.maxRows.toLocaleString()}{" "}
            rows.
          </Text>
        </Stack>
      </Drawer.Body>

      <Drawer.Footer
        justifyContent="flex-start"
        gap="2"
        borderTopWidth="1px"
        borderColor="gray.75"
      >
        <Button
          size="sm"
          loading={isPending}
          loadingText="Exporting..."
          onClick={() => formik.submitForm()}
        >
          Export
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onDone}
          disabled={isPending}
        >
          Cancel
        </Button>
      </Drawer.Footer>
    </>
  );
}

interface AdvancedExportDrawerProps {
  open: boolean;
  onClose: () => void;
  catalog: ExportCatalog;
  initialModule: string;
  scope?: ExportScope;
}

/** Zoho's "Export" dialog: module, period, format and password, built by the server. */
export function AdvancedExportDrawer({
  open,
  onClose,
  catalog,
  initialModule,
  scope,
}: AdvancedExportDrawerProps) {
  return (
    <Drawer.Root
      open={open}
      onOpenChange={(e) => !e.open && onClose()}
      placement="end"
      size="md"
      lazyMount
      unmountOnExit
    >
      <Portal>
        <Drawer.Backdrop />
        <Drawer.Positioner>
          <Drawer.Content>
            <ExportForm
              catalog={catalog}
              initialModule={initialModule}
              scope={scope}
              onDone={onClose}
            />
            <Drawer.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Drawer.CloseTrigger>
          </Drawer.Content>
        </Drawer.Positioner>
      </Portal>
    </Drawer.Root>
  );
}
