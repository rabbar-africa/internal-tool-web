import { Button, Flex, Grid, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomInput } from "@/components/input";
import { useCreateOrganizationBankAccount } from "@/features/settings/api";
import type { CreateOrgBankAccountPayload } from "@/shared/interface/settings";

const validationSchema = Yup.object({
  accountName: Yup.string().required("Account name is required"),
  accountNumber: Yup.string().required("Account number is required"),
  bankName: Yup.string().required("Bank name is required"),
});

interface BankAccountStepProps {
  onCompleted: () => void;
  onSkip: () => void;
}

export function BankAccountStep({ onCompleted, onSkip }: BankAccountStepProps) {
  const { mutateAsync, isPending } = useCreateOrganizationBankAccount();

  const formik = useFormik({
    initialValues: {
      accountName: "",
      accountNumber: "",
      bankName: "",
      bankCode: "",
      isPrimary: true,
    },
    validationSchema,
    validateOnChange: false,
    onSubmit: async (values) => {
      const payload: CreateOrgBankAccountPayload = {
        accountName: values.accountName,
        accountNumber: values.accountNumber,
        bankName: values.bankName,
        bankCode: values.bankCode || undefined,
        isPrimary: values.isPrimary,
      };
      await mutateAsync(payload);
      onCompleted();
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Stack gap="4">
        <CustomInput
          label="Account Name"
          required
          name="accountName"
          value={formik.values.accountName}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="e.g. Rabbar Africa Ltd"
          error={
            formik.touched.accountName && formik.errors.accountName
              ? formik.errors.accountName
              : undefined
          }
        />
        <Grid templateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap="4">
          <CustomInput
            label="Account Number"
            required
            name="accountNumber"
            value={formik.values.accountNumber}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="0123456789"
            error={
              formik.touched.accountNumber && formik.errors.accountNumber
                ? formik.errors.accountNumber
                : undefined
            }
          />
          <CustomInput
            label="Bank Name"
            required
            name="bankName"
            value={formik.values.bankName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Guaranty Trust Bank"
            error={
              formik.touched.bankName && formik.errors.bankName
                ? formik.errors.bankName
                : undefined
            }
          />
        </Grid>

        {/* <CustomSwitch
          reversed
          checked={formik.values.isPrimary}
          onCheckedChange={(e: { checked: boolean }) =>
            formik.setFieldValue("isPrimary", e.checked)
          }
        >
          Set as primary account
        </CustomSwitch> */}

        <Flex gap="3" pt="2">
          <Button
            variant="outline"
            flex="1"
            onClick={onSkip}
            disabled={isPending}
          >
            Skip for now
          </Button>
          <Button
            type="submit"
            flex="1"
            loading={isPending}
            loadingText="Saving..."
          >
            Save & continue
          </Button>
        </Flex>
      </Stack>
    </form>
  );
}
