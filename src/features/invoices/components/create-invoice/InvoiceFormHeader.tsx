import { useState } from "react";
import { Box, Flex, Grid, IconButton, Stack, Text } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomInput } from "@/components/input/CustomInput";
import type { CreateInvoiceFormValues } from "./hooks/useCreateInvoice";
import {
  PAYMENT_TERMS_OPTIONS,
  DEFAULT_INVOICE_PREFIX,
  DEFAULT_INVOICE_NEXT,
} from "./hooks/useCreateInvoice";
import type { Customer } from "@/shared/interface/customer";
import {
  InvoiceNumberConfigModal,
  type InvoiceNumberConfig,
} from "./InvoiceNumberConfigModal";
import { AddNewCustomerModal } from "./AddNewCustomerModal";

interface InvoiceFormHeaderProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  customerOptions: { label: string; value: string }[];
  selectedCustomer: Customer | undefined;
  onAddNewCustomer: (customer: Customer) => void;
}

export function InvoiceFormHeader({
  formik,
  customerOptions,
  selectedCustomer,
  onAddNewCustomer,
}: InvoiceFormHeaderProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);
  const [invoiceConfig, setInvoiceConfig] = useState<InvoiceNumberConfig>({
    mode: "auto",
    prefix: DEFAULT_INVOICE_PREFIX,
    nextNumber: DEFAULT_INVOICE_NEXT,
  });

  const handleSaveConfig = (config: InvoiceNumberConfig) => {
    setInvoiceConfig(config);
    if (config.mode === "auto") {
      formik.setFieldValue(
        "invoice_number",
        `${config.prefix}${config.nextNumber}`,
      );
    }
  };

  return (
    <>
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={{ base: "6", md: "10" }}
        p={{ base: "4", md: "6" }}
      >
        {/* Left: Customer */}
        <Stack gap="4">
          <SearchCombobox
            label="Customer Name"
            required
            options={customerOptions}
            placeholder="Select or type a customer..."
            value={formik.values.customer_id || undefined}
            onChange={(val) => formik.setFieldValue("customer_id", val)}
            error={
              formik.touched.customer_id && formik.errors.customer_id
                ? String(formik.errors.customer_id)
                : undefined
            }
            footerAction={{
              label: "Add Customer",
              onClick: () => setAddCustomerOpen(true),
            }}
          />

          {selectedCustomer ? (
            <Box
              p="3"
              bg="gray.25"
              borderWidth="1px"
              borderColor="gray.75"
              rounded="md"
            >
              <Text
                fontSize="11px"
                fontWeight="600"
                color="gray.300"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb="2"
              >
                Billing Address
              </Text>
              <Text fontSize="13px" fontWeight="500" color="gray.500">
                {selectedCustomer.name}
              </Text>
              {selectedCustomer.address && (
                <Text fontSize="13px" color="gray.400">
                  {selectedCustomer.address}
                </Text>
              )}
              <Text fontSize="13px" color="gray.400">
                {[selectedCustomer.city, selectedCustomer.state]
                  .filter(Boolean)
                  .join(", ")}
              </Text>
              <Text fontSize="13px" color="gray.400">
                {selectedCustomer.country}
              </Text>
              {selectedCustomer.email && (
                <Text fontSize="13px" color="gray.400" mt="1">
                  {selectedCustomer.email}
                </Text>
              )}
              {selectedCustomer.phone && (
                <Text fontSize="13px" color="gray.400">
                  {selectedCustomer.phone}
                </Text>
              )}
            </Box>
          ) : (
            <Flex
              align="center"
              justify="center"
              h="100px"
              borderWidth="1px"
              borderColor="gray.75"
              borderStyle="dashed"
              rounded="md"
            >
              <Text fontSize="13px" color="gray.200">
                Billing address will appear here
              </Text>
            </Flex>
          )}
        </Stack>

        {/* Right: Invoice metadata */}
        <Stack gap="4">
          {/* Invoice # + Order Number */}
          <Grid templateColumns="1fr 1fr" gap="4">
            <Box>
              <Text
                fontSize=".625rem"
                fontWeight="600"
                color="gray.300"
                textTransform="uppercase"
                letterSpacing="0.05em"
                mb=".625rem"
              >
                Invoice #
                <Text as="span" color="error.300" ml="0.5">
                  *
                </Text>
              </Text>
              <Flex align="center" gap="2">
                <Box flex={1}>
                  <CustomInput
                    placeholder="e.g. RINV-123456"
                    name="invoice_number"
                    value={formik.values.invoice_number}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={invoiceConfig.mode === "auto"}
                    error={
                      (formik.touched.invoice_number ||
                        formik.submitCount > 0) &&
                      formik.errors.invoice_number
                        ? String(formik.errors.invoice_number)
                        : undefined
                    }
                  />
                </Box>
                <IconButton
                  aria-label="Configure invoice number"
                  variant="ghost"
                  size="sm"
                  color="gray.300"
                  _hover={{ color: "primary.400", bg: "primary.50" }}
                  onClick={() => setShowConfig(true)}
                  mt={formik.errors.invoice_number ? "-4" : "0"}
                >
                  ⚙
                </IconButton>
              </Flex>
            </Box>

            <CustomInput
              label="Order Number"
              placeholder="e.g. PO-12345"
              name="reference_number"
              value={formik.values.reference_number}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          {/* Invoice Date + Terms + Due Date */}
          <Grid templateColumns="1fr 1fr" gap="4">
            <CustomInput
              label="Invoice Date"
              type="date"
              required
              name="date"
              value={formik.values.date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.date && formik.errors.date
                  ? String(formik.errors.date)
                  : undefined
              }
            />
            <CustomInput
              label="Due Date"
              type="date"
              required
              name="due_date"
              value={formik.values.due_date}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.due_date && formik.errors.due_date
                  ? String(formik.errors.due_date)
                  : undefined
              }
            />
          </Grid>

          <CustomSelect
            label="Payment Terms"
            options={PAYMENT_TERMS_OPTIONS}
            value={
              formik.values.payment_terms
                ? [formik.values.payment_terms]
                : ["0"]
            }
            onChange={(opt: { value: string[] }) => {
              const val = Array.isArray(opt?.value)
                ? opt.value[0]
                : (opt?.value ?? "0");
              formik.setFieldValue("payment_terms", val);
            }}
          />
        </Stack>
      </Grid>

      <InvoiceNumberConfigModal
        open={showConfig}
        onClose={() => setShowConfig(false)}
        config={invoiceConfig}
        onSave={handleSaveConfig}
      />

      <AddNewCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSave={(customer) => {
          onAddNewCustomer(customer);
          formik.setFieldValue("customer_id", customer.id);
          setAddCustomerOpen(false);
        }}
      />
    </>
  );
}
