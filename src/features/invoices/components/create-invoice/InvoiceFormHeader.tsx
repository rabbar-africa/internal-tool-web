import { Box, Grid, Stack, Text, Flex } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomInput } from "@/components/input/CustomInput";
import type { CreateInvoiceFormValues } from "./hooks/useCreateInvoice";
import type { Customer } from "@/shared/interface/customer";
import { PAYMENT_TERMS_OPTIONS } from "./hooks/useCreateInvoice";

interface InvoiceFormHeaderProps {
  formik: FormikProps<CreateInvoiceFormValues>;
  customerOptions: { label: string; value: string }[];
  selectedCustomer: Customer | undefined;
}

export function InvoiceFormHeader({
  formik,
  customerOptions,
  selectedCustomer,
}: InvoiceFormHeaderProps) {
  return (
    <Grid
      templateColumns={{ base: "1fr", md: "1fr 1fr" }}
      gap={{ base: "6", md: "10" }}
      p={{ base: "4", md: "6" }}
    >
      {/* Left: Customer */}
      <Stack gap="4">
        <CustomSelect
          label="Customer Name"
          required
          options={customerOptions}
          placeholder="Select a customer..."
          value={
            formik.values.customer_id ? [formik.values.customer_id] : undefined
          }
          onChange={(opt: { value: string[] }) => {
            const val = Array.isArray(opt?.value)
              ? opt.value[0]
              : (opt?.value ?? "");
            formik.setFieldValue("customer_id", val);
          }}
          error={
            formik.touched.customer_id && formik.errors.customer_id
              ? String(formik.errors.customer_id)
              : undefined
          }
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
            label="Reference #"
            placeholder="e.g. PO-12345"
            name="reference_number"
            value={formik.values.reference_number}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Grid>

        <Grid templateColumns="1fr 1fr" gap="4">
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
      </Stack>
    </Grid>
  );
}
