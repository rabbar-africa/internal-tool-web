import { Grid } from "@chakra-ui/react";
import type { FormikProps } from "formik";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { AccountSelect } from "@/features/settings/components/account-details/AccountSelect";
import { PaymentModeDto } from "@/shared/interface/payment";
import { SectionCard } from "./SectionCard";
import {
  PAYMENT_MODE_OPTIONS,
  type CreatePaymentFormValues,
} from "./hooks/useCreatePayment";

interface PresetPaymentFieldsProps {
  formik: FormikProps<CreatePaymentFormValues>;
  onModeChange: (mode: PaymentModeDto) => void;
  onSelectDepositAccount: (id: string) => void;
  depositFallbackAccountId: string | null;
}

export function PresetPaymentFields({
  formik,
  onModeChange,
  onSelectDepositAccount,
  depositFallbackAccountId,
}: PresetPaymentFieldsProps) {
  const { values, errors, touched } = formik;

  return (
    <SectionCard
      step={2}
      title="Payment Details"
      subtitle="Enter the amount received, how it was paid, and when"
    >
      <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
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
        <CustomInput
          label="Payment Date"
          type="date"
          required
          name="date"
          value={values.date}
          onChange={formik.handleChange}
          error={touched.date && errors.date ? errors.date : undefined}
        />
        <AccountSelect
          label="Paid Into"
          includeCash
          isCash={values.mode === PaymentModeDto.CASH}
          fallbackAccountId={depositFallbackAccountId}
          value={values.depositToAccountId}
          onChange={onSelectDepositAccount}
        />
      </Grid>
    </SectionCard>
  );
}
