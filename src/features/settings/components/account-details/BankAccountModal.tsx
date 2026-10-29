import { useEffect } from "react";
import {
  Button,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CustomSwitch } from "@/components/input";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { BankAccountFields } from "./BankAccountFields";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import type {
  CreateOrgBankAccountPayload,
  IOrgBankAccount,
} from "@/shared/interface/settings";
import {
  useCreateOrganizationBankAccount,
  useUpdateOrganizationBankAccount,
} from "../../api";

interface BankAccountModalProps {
  open: boolean;
  onClose: () => void;
  account?: IOrgBankAccount | null;
}

type BankAccountFormValues = Omit<
  CreateOrgBankAccountPayload,
  "openingBalance" | "openingBalanceDate"
> & {
  /** Kept as typed; "" saves as 0. */
  openingBalance: string;
  /** YYYY-MM-DD; "" means "from the start". */
  openingBalanceDate: string;
};

const bankSchema = Yup.object({
  bankName: Yup.string().required("Bank is required"),
  accountName: Yup.string().required("Account name is required"),
  accountNumber: Yup.string()
    .required("Account number is required")
    .matches(/^\d{10}$/, "Account number must be exactly 10 digits"),
});

// The Cash account has no number or bank: only a name and opening balance.
const cashSchema = Yup.object({
  accountName: Yup.string().required("Account name is required"),
});

export function BankAccountModal({
  open,
  onClose,
  account,
}: BankAccountModalProps) {
  const isEdit = !!account;
  const isCash = account?.type === "CASH";
  const { mutate: createAccount, isPending: isCreating } =
    useCreateOrganizationBankAccount();
  const { mutate: updateAccount, isPending: isUpdating } =
    useUpdateOrganizationBankAccount();

  const formik = useFormik<BankAccountFormValues>({
    enableReinitialize: true,
    validationSchema: isCash ? cashSchema : bankSchema,
    initialValues: {
      bankName: account?.bankName ?? "",
      accountName: account?.accountName ?? "",
      accountNumber: account?.accountNumber ?? "",
      bankCode: account?.bankCode ?? "",
      isPrimary: account?.isPrimary ?? false,
      openingBalance:
        account?.openingBalance != null && Number(account.openingBalance)
          ? String(Number(account.openingBalance))
          : "",
      openingBalanceDate: account?.openingBalanceDate?.slice(0, 10) ?? "",
    },
    onSubmit: (values) => {
      const { openingBalance, openingBalanceDate, ...bank } = values;
      const balance = {
        openingBalance: Number(openingBalance) || 0,
        // null clears a saved date; a new account just leaves it out.
        openingBalanceDate: openingBalanceDate || (isEdit ? null : undefined),
      };
      if (isEdit && account) {
        // The API refuses bank details or "primary" on the Cash account.
        const payload = isCash
          ? { accountName: values.accountName, ...balance }
          : { ...bank, ...balance };
        updateAccount({ id: account.id, payload }, { onSuccess: onClose });
      } else {
        createAccount({ ...bank, ...balance }, { onSuccess: onClose });
      }
    },
  });

  useEffect(() => {
    if (!open) formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
      closeOnInteractOutside={false}
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="30rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body
              overflow="auto"
              maxH="min(44.375rem, calc(100dvh - 4rem))"
              css={chakraScrollbarStyle}
            >
              <form onSubmit={formik.handleSubmit}>
                <Stack gap="5">
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    {isCash
                      ? "Edit Cash Account"
                      : isEdit
                        ? "Edit Bank Account"
                        : "Add Bank Account"}
                  </Text>
                  {isCash ? (
                    <CustomInput
                      label="Account Name"
                      required
                      name="accountName"
                      value={formik.values.accountName}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      placeholder="e.g. Cash, Till"
                      error={
                        formik.touched.accountName
                          ? formik.errors.accountName
                          : undefined
                      }
                    />
                  ) : (
                    <BankAccountFields
                      values={{
                        bankName: formik.values.bankName,
                        bankCode: formik.values.bankCode ?? "",
                        accountNumber: formik.values.accountNumber,
                        accountName: formik.values.accountName,
                      }}
                      disabled={isCreating || isUpdating}
                      onChange={(patch) =>
                        formik.setValues((current) => ({
                          ...current,
                          ...patch,
                        }))
                      }
                      errors={{
                        bankName: formik.touched.bankName
                          ? (formik.errors.bankName as string)
                          : undefined,
                        accountNumber: formik.touched.accountNumber
                          ? (formik.errors.accountNumber as string)
                          : undefined,
                        accountName: formik.touched.accountName
                          ? (formik.errors.accountName as string)
                          : undefined,
                      }}
                    />
                  )}
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomNumberInput
                      label="Opening Balance (₦)"
                      precision={2}
                      placeholder="0.00"
                      name="openingBalance"
                      value={formik.values.openingBalance}
                      onValueChange={(raw) =>
                        formik.setFieldValue("openingBalance", raw)
                      }
                    />
                    <CustomInput
                      label="Balance On"
                      type="date"
                      name="openingBalanceDate"
                      value={formik.values.openingBalanceDate}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <Text fontSize="12px" color="gray.300" mt="-3">
                    What this account held on this date. Statements start from
                    here.
                  </Text>
                  {!isCash && (
                    <CustomSwitch
                      reversed
                      checked={formik.values.isPrimary}
                      onCheckedChange={(e: { checked: boolean }) =>
                        formik.setFieldValue("isPrimary", e.checked)
                      }
                    >
                      Set as primary account
                    </CustomSwitch>
                  )}
                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isCreating || isUpdating}>
                      {isEdit ? "Save Changes" : "Add Account"}
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
