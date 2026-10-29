import { Grid } from "@chakra-ui/react";
import type { FormikProps } from "formik";
// import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import { PaymentModeDto } from "@/shared/interface/payment";
import { SectionCard } from "./SectionCard";
import {
  PAYMENT_MODE_OPTIONS,
  type CreatePaymentFormValues,
} from "./hooks/useCreatePayment";

interface PaymentDetailsProps {
  formik: FormikProps<CreatePaymentFormValues>;
  onModeChange: (mode: PaymentModeDto) => void;
  onSelectDepositAccount: (id: string) => void;
  depositFallbackAccountId: string | null;
}

export function PaymentDetails({
  formik,
  onModeChange,
  onSelectDepositAccount,
  depositFallbackAccountId,
}: PaymentDetailsProps) {
  const { values, errors, touched } = formik;

  return (
    <SectionCard
      step={2}
      title="Payment Details"
      subtitle="How was the payment made?"
    >
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
        <CustomSelect
          label="Payment Mode"
          required
          options={PAYMENT_MODE_OPTIONS}
          value={[values.mode]}
          onChange={(opt: { value: string[] }) =>
            onModeChange(opt?.value?.[0] as PaymentModeDto)
          }
          error={touched.mode && errors.mode ? errors.mode : undefined}
        />
        <AccountSelect
          label="Deposit To"
          includeCash
          isCash={values.mode === PaymentModeDto.CASH}
          fallbackAccountId={depositFallbackAccountId}
          value={values.depositToAccountId}
          onChange={onSelectDepositAccount}
        />

        <CustomNumberInput
          label="Amount Received"
          required
          precision={2}
          allowNegative={false}
          min={0}
          name="amount"
          value={values.amount}
          onValueChange={(str) => formik.setFieldValue("amount", str)}
          error={touched.amount && errors.amount ? errors.amount : undefined}
        />

        {/* <CustomNumberInput
          label="Bank Charges"
          precision={2}
          allowNegative={false}
          min={0}
          name="bankCharges"
          value={values.bankCharges}
          onValueChange={(str) => formik.setFieldValue("bankCharges", str)}
          error={
            touched.bankCharges && errors.bankCharges
              ? errors.bankCharges
              : undefined
          }
        />

        <CustomInput
          label="Currency"
          name="currencyCode"
          value={values.currencyCode}
          onChange={formik.handleChange}
        />

        <CustomNumberInput
          label="Exchange Rate"
          precision={4}
          allowNegative={false}
          min={0}
          name="exchangeRate"
          value={values.exchangeRate}
          onValueChange={(str) => formik.setFieldValue("exchangeRate", str)}
          error={
            touched.exchangeRate && errors.exchangeRate
              ? errors.exchangeRate
              : undefined
          }
        /> */}
      </Grid>
    </SectionCard>
  );
}
