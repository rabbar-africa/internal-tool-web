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
import { CustomInput, CustomSwitch } from "@/components/input";
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

const validationSchema = Yup.object({
  bankName: Yup.string().required("Bank name is required"),
  accountName: Yup.string().required("Account name is required"),
  accountNumber: Yup.string().required("Account number is required"),
});

export function BankAccountModal({
  open,
  onClose,
  account,
}: BankAccountModalProps) {
  const isEdit = !!account;
  const { mutate: createAccount, isPending: isCreating } =
    useCreateOrganizationBankAccount();
  const { mutate: updateAccount, isPending: isUpdating } =
    useUpdateOrganizationBankAccount();

  const formik = useFormik<CreateOrgBankAccountPayload>({
    enableReinitialize: true,
    validationSchema,
    initialValues: {
      bankName: account?.bankName ?? "",
      accountName: account?.accountName ?? "",
      accountNumber: account?.accountNumber ?? "",
      bankCode: account?.bankCode ?? "",
      isPrimary: account?.isPrimary ?? false,
    },
    onSubmit: (values) => {
      if (isEdit && account) {
        updateAccount(
          { id: account.id, payload: values },
          { onSuccess: onClose },
        );
      } else {
        createAccount(values, { onSuccess: onClose });
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
                    {isEdit ? "Edit Bank Account" : "Add Bank Account"}
                  </Text>
                  <CustomInput
                    label="Bank Name"
                    required
                    name="bankName"
                    value={formik.values.bankName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.bankName
                        ? (formik.errors.bankName as string)
                        : undefined
                    }
                  />
                  <CustomInput
                    label="Account Name"
                    required
                    name="accountName"
                    value={formik.values.accountName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.accountName
                        ? (formik.errors.accountName as string)
                        : undefined
                    }
                  />
                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomInput
                      label="Account Number"
                      required
                      name="accountNumber"
                      value={formik.values.accountNumber}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.accountNumber
                          ? (formik.errors.accountNumber as string)
                          : undefined
                      }
                    />
                    <CustomInput
                      label="Bank / Sort Code"
                      name="bankCode"
                      value={formik.values.bankCode ?? ""}
                      onChange={formik.handleChange}
                    />
                  </Grid>
                  <CustomSwitch
                    reversed
                    checked={formik.values.isPrimary}
                    onCheckedChange={(e: { checked: boolean }) =>
                      formik.setFieldValue("isPrimary", e.checked)
                    }
                  >
                    Set as primary account
                  </CustomSwitch>
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
