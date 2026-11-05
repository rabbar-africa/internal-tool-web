import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Center,
  Checkbox,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useGetInvoiceDeleteImpactQuery } from "@/features/invoices/api/query";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import type {
  DeleteInvoiceOptions,
  IInvoiceDeleteImpact,
} from "@/shared/interface/invoice";

export interface InvoiceDeleteTarget {
  /** Identity used for the actual delete operation. */
  id: string;
  /** Human-readable label shown in the confirmation copy. */
  invoiceNumber: string;
}

interface DeleteInvoiceConfirmProps {
  target: InvoiceDeleteTarget | null;
  isDeleting: boolean;
  onCancel: () => void;
  /** Receives the id so the parent can't accidentally delete by number. */
  onConfirm: (id: string, options: DeleteInvoiceOptions) => void;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const day = (value: string) => moment(value).format("DD MMM YYYY");

function keptNote(
  payment: IInvoiceDeleteImpact["payments"][number],
  money: (n: number) => string,
): string | null {
  const credit = `${money(payment.appliedHere)} becomes credit for the customer.`;
  switch (payment.keptBecause) {
    case "OTHER_INVOICES":
      return `This payment also covers ${payment.otherInvoiceNumbers.join(", ")}, so it stays. ${credit}`;
    case "REFUNDED":
      return `Part of this payment was refunded, so it stays. ${credit}`;
    case "HAS_CREDIT":
      return `This payment also holds customer credit, so it stays. ${credit}`;
    default:
      return null;
  }
}

function Row({
  title,
  detail,
  amount,
  note,
}: {
  title: string;
  detail: string;
  amount: string;
  note?: string | null;
}) {
  return (
    <Box>
      <Flex justify="space-between" gap="3">
        <Text fontSize="13px" color="gray.500" fontWeight="500">
          {title}
        </Text>
        <Text fontSize="13px" color="gray.500" fontWeight="600" flexShrink={0}>
          {amount}
        </Text>
      </Flex>
      <Text fontSize="12px" color="gray.300">
        {detail}
      </Text>
      {note && (
        <Text fontSize="12px" color="gray.400" mt="0.5">
          {note}
        </Text>
      )}
    </Box>
  );
}

function Attached({
  title,
  rows,
  tick,
  effect,
}: {
  title: string;
  rows: ReactNode;
  tick?: { label: string; checked: boolean; onChange: (v: boolean) => void };
  effect: string;
}) {
  return (
    <Stack
      gap="2"
      borderWidth="1px"
      borderColor="gray.100"
      rounded="md"
      p="3"
      data-testid="delete-invoice-attached"
    >
      <Text fontSize="13px" fontWeight="600" color="gray.500">
        {title}
      </Text>
      <Stack gap="2">{rows}</Stack>
      {tick && (
        <Checkbox.Root
          checked={tick.checked}
          onCheckedChange={({ checked }) => tick.onChange(checked === true)}
          size="sm"
          mt="1"
        >
          <Checkbox.HiddenInput />
          <Checkbox.Control />
          <Checkbox.Label fontSize="13px" color="gray.500">
            {tick.label}
          </Checkbox.Label>
        </Checkbox.Root>
      )}
      <Text fontSize="12px" color="gray.400">
        {effect}
      </Text>
    </Stack>
  );
}

/** Mounted per invoice, so the ticks never carry over to the next one. */
function DeleteInvoiceContent({
  target,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteInvoiceConfirmProps & { target: InvoiceDeleteTarget }) {
  const { formatMoney } = useFormatMoney();
  const { data, isLoading, isError, refetch } = useGetInvoiceDeleteImpactQuery(
    target.id,
  );
  const [deletePayments, setDeletePayments] = useState(false);
  const [deleteExpenses, setDeleteExpenses] = useState(false);

  const impact = data?.data;
  const money = (n: number) =>
    formatMoney(n, { currencyCode: impact?.invoice.currencyCode });

  const payments = impact?.payments ?? [];
  const expenses = impact?.expenses ?? [];
  const deletable = payments.filter((p) => !p.keptBecause);
  const paymentsGo = deletePayments ? deletable : [];
  const toCredit = sum(
    payments.filter((p) => !paymentsGo.includes(p)).map((p) => p.appliedHere),
  );
  const canTickPayments =
    Boolean(impact?.can.deletePayments) && deletable.length > 0;

  const paymentEffect = [
    paymentsGo.length > 0 &&
      `${money(sum(paymentsGo.map((p) => p.amount)))} will be removed from your payments and account statements.`,
    toCredit > 0 &&
      `${money(toCredit)} stays on your records and becomes credit for the customer.`,
  ]
    .filter(Boolean)
    .join(" ");

  const jobCard = impact?.invoice.jobCard;
  const expensesTotal = money(sum(expenses.map((e) => e.amount)));
  const expenseEffect = deleteExpenses
    ? `${expensesTotal} will be removed from your expenses, account statements and profit figures.`
    : `${expensesTotal} stays on your records, no longer linked to this invoice.${
        jobCard ? ` It still counts as a cost on job ${jobCard.jobNumber}.` : ""
      }`;

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          <Text textStyle="large-bold" color="gray.500">
            Delete invoice?
          </Text>
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body maxH="60vh" overflowY="auto">
        <Stack gap="3">
          <Text textStyle="small-regular" color="gray.400">
            Invoice{" "}
            <Text as="span" fontWeight="600" color="gray.500">
              {target.invoiceNumber}
            </Text>{" "}
            will be removed from your invoices. This can't be undone.
          </Text>

          {isLoading && (
            <Center py="4">
              <Spinner size="sm" color="gray.300" />
            </Center>
          )}

          {isError && (
            <Flex align="center" justify="space-between" gap="3">
              <Text fontSize="13px" color="error.300">
                We couldn't check what is attached to this invoice.
              </Text>
              <Button size="xs" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </Flex>
          )}

          {payments.length > 0 && (
            <Attached
              title="Payments on this invoice"
              rows={payments.map((p) => (
                <Row
                  key={p.id}
                  title={p.paymentNumber}
                  detail={[day(p.date), p.account].filter(Boolean).join(" · ")}
                  amount={money(p.amount)}
                  note={keptNote(p, money)}
                />
              ))}
              tick={
                canTickPayments
                  ? {
                      label:
                        deletable.length === payments.length
                          ? "Also delete these payments"
                          : "Also delete the payments only for this invoice",
                      checked: deletePayments,
                      onChange: setDeletePayments,
                    }
                  : undefined
              }
              effect={paymentEffect}
            />
          )}

          {expenses.length > 0 && (
            <Attached
              title="Expenses on this invoice"
              rows={expenses.map((e) => (
                <Row
                  key={e.id}
                  title={e.name}
                  detail={[e.expenseNumber, day(e.date), e.account]
                    .filter(Boolean)
                    .join(" · ")}
                  amount={money(e.amount)}
                />
              ))}
              tick={
                impact?.can.deleteExpenses
                  ? {
                      label: "Also delete these expenses",
                      checked: deleteExpenses,
                      onChange: setDeleteExpenses,
                    }
                  : undefined
              }
              effect={expenseEffect}
            />
          )}

          {jobCard && (
            <Text fontSize="12px" color="gray.400">
              It will be taken off job {jobCard.jobNumber}.
            </Text>
          )}
          {impact?.carriedOnto && (
            <Text fontSize="12px" color="gray.400">
              Its balance is shown on {impact.carriedOnto.invoiceNumber} as an
              old balance. It will be taken off, so that invoice's total to pay
              goes down.
            </Text>
          )}
          {impact && impact.carries.length > 0 && (
            <Text fontSize="12px" color="gray.400">
              {impact.carries.map((c) => c.invoiceNumber).join(", ")} brought
              forward on this invoice will stay unpaid, and can be brought
              forward again.
            </Text>
          )}
        </Stack>
      </Dialog.Body>
      <Dialog.Footer>
        <Flex gap="2" justify="flex-end" w="100%">
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            bg="red.500"
            color="white"
            _hover={{ bg: "red.600" }}
            onClick={() =>
              onConfirm(target.id, { deletePayments, deleteExpenses })
            }
            loading={isDeleting}
            loadingText="Deleting..."
            // Nobody confirms without seeing what is attached.
            disabled={!impact}
          >
            Delete
          </Button>
        </Flex>
      </Dialog.Footer>
    </>
  );
}

export function DeleteInvoiceConfirm(props: DeleteInvoiceConfirmProps) {
  const { target, onCancel } = props;
  return (
    <Dialog.Root
      open={Boolean(target)}
      onOpenChange={({ open }) => {
        if (!open) onCancel();
      }}
      placement="center"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="520px">
            {target && (
              <DeleteInvoiceContent
                key={target.id}
                {...props}
                target={target}
              />
            )}
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
