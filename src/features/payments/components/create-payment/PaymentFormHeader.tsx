import { Grid, Stack } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SearchCombobox } from "@/components/input/SearchCombobox";
import { SectionCard } from "./SectionCard";
import {
  PAYMENT_STATUS_OPTIONS,
  type CreatePaymentFormValues,
} from "./hooks/useCreatePayment";

interface PaymentFormHeaderProps {
  formik: FormikProps<CreatePaymentFormValues>;
  customerOptions: { label: string; value: string }[];
  isSearchingCustomers: boolean;
  onCustomerSearch: (query: string) => void;
  onSelectCustomer: (id: string) => void;
}

export function PaymentFormHeader({
  formik,
  customerOptions,
  isSearchingCustomers,
  onCustomerSearch,
  onSelectCustomer,
}: PaymentFormHeaderProps) {
  const { values, errors, touched } = formik;

  return (
    <SectionCard
      step={1}
      title="Customer & Reference"
      subtitle="Who is this payment from?"
    >
      <Stack gap="4">
        <SearchCombobox
          label="Customer"
          required
          placeholder="Search customer..."
          options={customerOptions}
          value={values.customerId || undefined}
          onChange={(val) => onSelectCustomer(val)}
          onSearchChange={onCustomerSearch}
          serverSearch
          isLoading={isSearchingCustomers}
          error={
            touched.customerId && errors.customerId
              ? errors.customerId
              : undefined
          }
        />

        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          {/* <CustomInput
            label="Payment Number"
            name="paymentNumber"
            placeholder="Auto-generated if left blank"
            value={values.paymentNumber}
            onChange={formik.handleChange}
          /> */}
          <CustomInput
            label="Reference Number"
            name="referenceNumber"
            placeholder="e.g. TXN-123456"
            value={values.referenceNumber}
            onChange={formik.handleChange}
          />
          <CustomInput
            label="Payment Date"
            type="date"
            required
            name="date"
            value={values.date}
            onChange={formik.handleChange}
            error={touched.date && errors.date ? errors.date : undefined}
          />
          <CustomSelect
            label="Status"
            options={PAYMENT_STATUS_OPTIONS}
            value={[values.status]}
            onChange={(opt: any) =>
              formik.setFieldValue("status", opt?.value?.[0])
            }
          />
        </Grid>
      </Stack>
    </SectionCard>
  );
}
