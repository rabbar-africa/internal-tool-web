import { useMemo, useState } from "react";
import { Box, Flex, Grid, IconButton, Stack, Text } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomInput } from "@/components/input/CustomInput";
import type { CreateInvoiceFormValues } from "@/shared/interface/invoice";
import { PAYMENT_TERMS_OPTIONS } from "./hooks/useCreateInvoice";
import type { ICustomer } from "@/shared/interface/customer";
import { InvoiceNumberConfigModal } from "./InvoiceNumberConfigModal";
import { AddNewCustomerModal } from "./AddNewCustomerModal";
import { useGetOrganizationTransactionSeries } from "@/features/settings/api";

interface InvoiceFormHeaderProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  customerOptions: { label: string; value: string; subLabel?: string }[];
  selectedCustomer: ICustomer | null;
  onAddNewCustomer: (customer: ICustomer) => void;
  onCustomerSearch: (query: string) => void;
  isSearchingCustomers: boolean;
}

export function InvoiceFormHeader({
  formik,
  customerOptions,
  selectedCustomer,
  onAddNewCustomer,
  onCustomerSearch,
  isSearchingCustomers,
}: InvoiceFormHeaderProps) {
  const [showConfig, setShowConfig] = useState(false);
  const [addCustomerOpen, setAddCustomerOpen] = useState(false);

  const { data: txnSeriesData } = useGetOrganizationTransactionSeries();
  const isAutoInvoiceNumber = useMemo(
    () =>
      (txnSeriesData?.data ?? []).find((s) => s.module === "INVOICE")
        ?.autoGenerate ?? true,
    [txnSeriesData?.data],
  );

  return (
    <>
      <Grid
        templateColumns={{ base: "1fr", md: "1fr 1fr" }}
        gap={{ base: "6", md: "10" }}
        p={{ base: "4", md: "6" }}
      >
        {/* Left: Customer */}
        <Stack gap="4">
          <Box maxW={{ base: "15rem", lg: "unset" }}>
            <SearchCombobox
              label="Customer Name"
              required
              options={customerOptions}
              placeholder="Search customer..."
              value={formik.values.customerId || undefined}
              onChange={(val, option) => {
                formik.setFieldValue("customerId", val);
                formik.setFieldValue("customer", {
                  name: option.label,
                  email: option.subLabel ?? "",
                });
              }}
              onSearchChange={onCustomerSearch}
              searchDebounceMs={400}
              serverSearch
              isLoading={isSearchingCustomers}
              error={
                formik.touched.customerId && formik.errors.customerId
                  ? String(formik.errors.customerId)
                  : undefined
              }
              footerAction={{
                label: "Add Customer",
                onClick: () => setAddCustomerOpen(true),
              }}
            />
          </Box>

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
                {selectedCustomer.displayName}
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
              {selectedCustomer.country && (
                <Text fontSize="13px" color="gray.400">
                  {selectedCustomer.country}
                </Text>
              )}
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
          <Grid templateColumns="1fr" gap="4">
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
                    name="invoiceNumber"
                    value={formik.values.invoiceNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    disabled={isAutoInvoiceNumber}
                    error={
                      (formik.touched.invoiceNumber ||
                        formik.submitCount > 0) &&
                      formik.errors.invoiceNumber
                        ? String(formik.errors.invoiceNumber)
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
                  mt={formik.errors.invoiceNumber ? "-4" : "0"}
                >
                  ⚙
                </IconButton>
              </Flex>
            </Box>
            {/* 
            <CustomInput
              label="Order Number"
              placeholder="e.g. PO-12345"
              name="referenceNumber"
              value={formik.values.referenceNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            /> */}
          </Grid>

          {/* Invoice Date + Terms + Due Date */}
          <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
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
              name="dueDate"
              value={formik.values.dueDate}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.dueDate && formik.errors.dueDate
                  ? String(formik.errors.dueDate)
                  : undefined
              }
            />
          </Grid>

          <CustomSelect
            label="Payment Terms"
            options={PAYMENT_TERMS_OPTIONS}
            value={
              formik.values.paymentTerms ? [formik.values.paymentTerms] : ["0"]
            }
            onChange={(opt: { value: string[] }) => {
              const val = Array.isArray(opt?.value)
                ? opt.value[0]
                : (opt?.value ?? "0");
              formik.setFieldValue("paymentTerms", val);
            }}
          />
        </Stack>
      </Grid>

      <InvoiceNumberConfigModal
        open={showConfig}
        onClose={() => setShowConfig(false)}
        onApplyNumber={(num) => formik.setFieldValue("invoiceNumber", num)}
      />

      <AddNewCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSave={(customer) => {
          onAddNewCustomer(customer);
          formik.setFieldValue("customerId", customer.id);
          formik.setFieldValue("customer", {
            name: customer.displayName,
            email: customer.email ?? "",
          });
          setAddCustomerOpen(false);
        }}
      />
    </>
  );
}
