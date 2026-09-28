import { Button, Flex, Stack } from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useCreateOrganizationBankAccount } from "@/features/settings/api";
import { BankAccountFields } from "@/features/settings/components/account-details/BankAccountFields";
import type { CreateOrgBankAccountPayload } from "@/shared/interface/settings";

const validationSchema = Yup.object({
  accountName: Yup.string().required("Account name is required"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^\d{10}$/, "Account number must be exactly 10 digits"),
  bankName: Yup.string().required("Bank is required"),
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
        <BankAccountFields
          values={formik.values}
          disabled={isPending}
          onChange={(patch) =>
            formik.setValues((current) => ({ ...current, ...patch }))
          }
          errors={{
            bankName: formik.touched.bankName
              ? formik.errors.bankName
              : undefined,
            accountNumber: formik.touched.accountNumber
              ? formik.errors.accountNumber
              : undefined,
            accountName: formik.touched.accountName
              ? formik.errors.accountName
              : undefined,
          }}
        />

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
            variant="accent"
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
