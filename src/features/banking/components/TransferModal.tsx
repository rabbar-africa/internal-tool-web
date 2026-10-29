import { useMemo } from "react";
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
import { CustomInput } from "@/components/input/CustomInput";
import { CustomNumberInput } from "@/components/input/CustomNumberInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import { useAccountOptions } from "@/features/settings/components/account-details/AccountSelect";
import type { IAccountTransfer } from "@/shared/interface/banking";
import {
  useCreateAccountTransferMutation,
  useUpdateAccountTransferMutation,
} from "../api";

/**
 * - `deposit`: banking cash — from the Cash account into a bank.
 * - `withdraw`: cash out of a bank into the Cash account.
 * - `transfer`: any two accounts, e.g. bank to bank.
 */
export type TransferKind = "deposit" | "withdraw" | "transfer";

const TITLES: Record<TransferKind, { title: string; subtitle: string }> = {
  deposit: {
    title: "Deposit Cash to Bank",
    subtitle: "Cash taken from the till and paid into a bank account.",
  },
  withdraw: {
    title: "Withdraw Cash",
    subtitle: "Cash taken out of a bank account and put in the till.",
  },
  transfer: {
    title: "Transfer Between Accounts",
    subtitle: "Money moved from one of your accounts to another.",
  },
};

interface TransferFormValues {
  date: string;
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  referenceNumber: string;
  notes: string;
}

const validationSchema = Yup.object({
  date: Yup.string().required("Date is required"),
  fromAccountId: Yup.string().required("Choose the account the money left"),
  toAccountId: Yup.string()
    .required("Choose the account the money went into")
    .notOneOf([Yup.ref("fromAccountId")], "Choose two different accounts"),
  amount: Yup.number()
    .transform((value, original) => (original === "" ? undefined : value))
    .typeError("Amount must be a number")
    .moreThan(0, "Amount must be greater than 0")
    .required("Amount is required"),
});

interface TransferModalProps {
  open: boolean;
  onClose: () => void;
  kind?: TransferKind;
  /** Existing transfer when editing; overrides `kind`'s pre-fill. */
  transfer?: IAccountTransfer | null;
  /** The account the action was started from (e.g. its settings card). */
  accountId?: string;
}

export function TransferModal({
  open,
  onClose,
  kind = "transfer",
  transfer,
  accountId,
}: TransferModalProps) {
  const isEdit = Boolean(transfer);
  const { accounts, options, isLoading } = useAccountOptions({
    includeCash: true,
  });
  const { mutateAsync: createTransfer, isPending: isCreating } =
    useCreateAccountTransferMutation();
  const { mutateAsync: updateTransfer, isPending: isUpdating } =
    useUpdateAccountTransferMutation();

  const initialValues = useMemo<TransferFormValues>(() => {
    if (transfer) {
      return {
        date: transfer.date.slice(0, 10),
        fromAccountId: transfer.fromAccountId,
        toAccountId: transfer.toAccountId,
        amount: String(Number(transfer.amount)),
        referenceNumber: transfer.referenceNumber ?? "",
        notes: transfer.notes ?? "",
      };
    }
    const cashId = accounts.find((a) => a.type === "CASH")?.id ?? "";
    const startedOn = accounts.find((a) => a.id === accountId);
    // Deposit / withdraw: the bank side is the account the action started
    // from when that is a bank, otherwise the primary.
    const bankId =
      (startedOn?.type === "BANK" ? startedOn.id : undefined) ??
      accounts.find((a) => a.isPrimary && a.type === "BANK")?.id ??
      "";
    const sides =
      kind === "deposit"
        ? { fromAccountId: cashId, toAccountId: bankId }
        : kind === "withdraw"
          ? { fromAccountId: bankId, toAccountId: cashId }
          : { fromAccountId: accountId ?? "", toAccountId: "" };
    return {
      date: new Date().toISOString().split("T")[0],
      amount: "",
      referenceNumber: "",
      notes: "",
      ...sides,
    };
    // Re-seed each time the dialog opens, and once accounts arrive.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, transfer, kind, accountId, accounts]);

  const formik = useFormik<TransferFormValues>({
    enableReinitialize: true,
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        date: values.date,
        fromAccountId: values.fromAccountId,
        toAccountId: values.toAccountId,
        amount: Number(values.amount),
        referenceNumber: values.referenceNumber || undefined,
        notes: values.notes || undefined,
      };
      if (transfer) {
        await updateTransfer({ id: transfer.id, payload });
      } else {
        await createTransfer(payload);
      }
      onClose();
    },
  });

  const { values, errors, touched } = formik;
  const isPending = isCreating || isUpdating;
  const copy = isEdit
    ? { title: "Edit Transfer", subtitle: TITLES.transfer.subtitle }
    : TITLES[kind];

  // Each side leaves out the account already chosen on the other.
  const fromOptions = options.filter((o) => o.value !== values.toAccountId);
  const toOptions = options.filter((o) => o.value !== values.fromAccountId);

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
          <Dialog.Content w="32rem" maxW="full" borderRadius="2xl" pt="2.5rem">
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
                  <Stack gap="1">
                    <Text fontSize="16px" fontWeight="600" color="gray.500">
                      {copy.title}
                    </Text>
                    <Text fontSize="13px" color="gray.300">
                      {copy.subtitle}
                    </Text>
                  </Stack>

                  <Grid
                    templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                    gap="4"
                  >
                    <CustomSelect
                      label="From"
                      required
                      placeholder="Select account..."
                      options={fromOptions}
                      loading={isLoading}
                      value={
                        values.fromAccountId
                          ? [values.fromAccountId]
                          : undefined
                      }
                      onChange={(opt: { value: string[] }) =>
                        formik.setFieldValue(
                          "fromAccountId",
                          opt?.value?.[0] ?? "",
                        )
                      }
                      error={
                        touched.fromAccountId ? errors.fromAccountId : undefined
                      }
                    />
                    <CustomSelect
                      label="To"
                      required
                      placeholder="Select account..."
                      options={toOptions}
                      loading={isLoading}
                      value={
                        values.toAccountId ? [values.toAccountId] : undefined
                      }
                      onChange={(opt: { value: string[] }) =>
                        formik.setFieldValue(
                          "toAccountId",
                          opt?.value?.[0] ?? "",
                        )
                      }
                      error={
                        touched.toAccountId ? errors.toAccountId : undefined
                      }
                    />
                    <CustomNumberInput
                      label="Amount (₦)"
                      required
                      precision={2}
                      min={0}
                      allowNegative={false}
                      placeholder="0.00"
                      name="amount"
                      value={values.amount}
                      onValueChange={(raw) =>
                        formik.setFieldValue("amount", raw)
                      }
                      onBlur={formik.handleBlur}
                      error={touched.amount ? errors.amount : undefined}
                    />
                    <CustomInput
                      label="Date"
                      type="date"
                      required
                      name="date"
                      value={values.date}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={touched.date ? errors.date : undefined}
                    />
                  </Grid>

                  <CustomInput
                    label={
                      kind === "deposit" && !isEdit
                        ? "Deposit Slip Number (optional)"
                        : "Reference Number (optional)"
                    }
                    name="referenceNumber"
                    value={values.referenceNumber}
                    onChange={formik.handleChange}
                    placeholder="e.g. slip or transaction number"
                  />
                  <CustomTextArea
                    label="Notes (optional)"
                    name="notes"
                    rows={2}
                    value={values.notes}
                    onChange={formik.handleChange}
                  />

                  <Flex gap="3" justify="flex-end" pt="2">
                    <Button variant="outline" type="button" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button type="submit" loading={isPending}>
                      {isEdit ? "Save Changes" : "Record Transfer"}
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
