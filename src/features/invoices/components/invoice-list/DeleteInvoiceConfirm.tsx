import {
  Box,
  Button,
  Center,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { useGetInvoiceDeleteImpactQuery } from "@/features/invoices/api/query";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  IInvoiceDeleteImpact,
  InvoiceDeleteBlocker,
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
  onConfirm: (id: string) => Promise<void> | void;
}

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const day = (value: string) => moment(value).format("DD MMM YYYY");

/** A linked record, ready to show with a way to open it. */
interface LinkedRecord {
  key: string;
  kindLabel: string;
  number: string;
  href: string;
  detail: string;
  amount?: string;
  /** What to do there, in the API's words. */
  howTo: string;
}

/**
 * What keeps the invoice from being deleted. The API lists it in `blocked`;
 * an older API doesn't, so the same list is built from the records it sends,
 * worded as the API words it, in the order they can be removed.
 */
function blockersOf(
  impact: IInvoiceDeleteImpact | undefined,
): InvoiceDeleteBlocker[] {
  if (!impact) return [];
  if (impact.blocked) return impact.blocked.blockers;
  const inv = impact.invoice.invoiceNumber;
  return [
    ...(impact.payments ?? []).map((p) => ({
      kind: "PAYMENT" as const,
      id: p.id,
      number: p.paymentNumber,
      howTo: p.otherInvoiceNumbers?.length
        ? `Edit ${p.paymentNumber} to take ${inv} off it. It also pays ${p.otherInvoiceNumbers.join(", ")}.`
        : `Delete ${p.paymentNumber}, or edit it to take ${inv} off it.`,
    })),
    ...(impact.creditsApplied ?? []).map((a) => ({
      kind: "CREDIT_APPLIED" as const,
      id: a.creditNote.id,
      number: a.creditNote.creditNoteNumber,
      applicationId: a.id,
      howTo: `Remove the credit from ${a.creditNote.creditNoteNumber} applied to ${inv}.`,
    })),
    ...(impact.creditNotes ?? [])
      .filter((cn) => cn.status !== "VOID")
      .map((cn) => ({
        kind: "CREDIT_NOTE" as const,
        id: cn.id,
        number: cn.creditNoteNumber,
        howTo:
          cn.status === "DRAFT"
            ? `Delete draft credit note ${cn.creditNoteNumber}.`
            : `Void credit note ${cn.creditNoteNumber}. Any of its credit applied or refunded has to be removed first.`,
      })),
    ...(impact.carriedOnto
      ? [
          {
            kind: "CARRIED_ONTO" as const,
            id: impact.carriedOnto.id,
            number: impact.carriedOnto.invoiceNumber,
            howTo: `Remove ${inv}'s old balance from ${impact.carriedOnto.invoiceNumber}.`,
          },
        ]
      : []),
  ];
}

/** The records keeping the invoice from being deleted, ready to show. */
function linkedRecords(
  impact: IInvoiceDeleteImpact | undefined,
  money: (n: number) => string,
): LinkedRecord[] {
  return blockersOf(impact).map(
    (blocker: InvoiceDeleteBlocker): LinkedRecord => {
      const base = {
        key: `${blocker.kind}:${blocker.applicationId ?? blocker.id}`,
        number: blocker.number,
        howTo: blocker.howTo,
      };
      switch (blocker.kind) {
        case "PAYMENT": {
          const p = impact?.payments.find((x) => x.id === blocker.id);
          return {
            ...base,
            kindLabel: "Payment",
            href: RouteConstants.payments.detail.generate({ id: blocker.id }),
            detail: [p && day(p.date), p?.account].filter(Boolean).join(" · "),
            amount: p ? money(p.amount) : undefined,
          };
        }
        case "CREDIT_APPLIED": {
          const a = impact?.creditsApplied.find(
            (x) => x.id === blocker.applicationId,
          );
          return {
            ...base,
            kindLabel: "Credit applied to this invoice",
            href: RouteConstants.creditNotes.detail.generate({
              id: blocker.id,
            }),
            detail: a ? day(a.date) : "",
            amount: a ? money(a.amount) : undefined,
          };
        }
        case "CREDIT_NOTE": {
          const cn = impact?.creditNotes.find((x) => x.id === blocker.id);
          return {
            ...base,
            kindLabel: "Credit note made from this invoice",
            href: RouteConstants.creditNotes.detail.generate({
              id: blocker.id,
            }),
            detail: cn
              ? [day(cn.date), cn.status.toLowerCase()].join(" · ")
              : "",
            amount: cn ? money(cn.total) : undefined,
          };
        }
        case "CARRIED_ONTO":
          return {
            ...base,
            kindLabel: "Shows this invoice as an old balance",
            href: RouteConstants.invoices.detail.generate({ id: blocker.id }),
            detail: "",
          };
      }
    },
  );
}

function LinkedRow({
  record,
  onView,
}: {
  record: LinkedRecord;
  onView: (href: string) => void;
}) {
  return (
    <Flex
      gap="3"
      align="center"
      justify="space-between"
      borderWidth="1px"
      borderColor="gray.100"
      rounded="md"
      p="3"
      data-testid="delete-invoice-blocker"
    >
      <Box minW={0}>
        <Text fontSize="12px" color="gray.400">
          {record.kindLabel}
        </Text>
        <Flex gap="2" align="baseline" wrap="wrap">
          <Text fontSize="13px" fontWeight="600" color="gray.500">
            {record.number}
          </Text>
          {record.amount && (
            <Text fontSize="13px" color="gray.500">
              {record.amount}
            </Text>
          )}
        </Flex>
        {record.detail && (
          <Text fontSize="12px" color="gray.300">
            {record.detail}
          </Text>
        )}
        <Text fontSize="12px" color="gray.400" mt="1">
          {record.howTo}
        </Text>
      </Box>
      <Button
        size="xs"
        variant="outline"
        flexShrink={0}
        onClick={() => onView(record.href)}
      >
        View
      </Button>
    </Flex>
  );
}

/** Mounted per invoice, so nothing carries over to the next one. */
function DeleteInvoiceContent({
  target,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteInvoiceConfirmProps & { target: InvoiceDeleteTarget }) {
  const { formatMoney } = useFormatMoney();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError, refetch } =
    useGetInvoiceDeleteImpactQuery(target.id);

  const impact = data?.data;
  const money = (n: number) =>
    formatMoney(n, { currencyCode: impact?.invoice.currencyCode });
  const linked = linkedRecords(impact, money);

  // Opening one closes the dialog; it asks afresh when opened again.
  const view = (href: string) => {
    onCancel();
    navigate(href);
  };

  const confirmDelete = async () => {
    try {
      await onConfirm(target.id);
    } catch {
      // Something was linked meanwhile: the toast says so, and the list shows it.
      await refetch();
    }
  };

  const expenses = impact?.expenses ?? [];
  const jobCard = impact?.invoice.jobCard;
  const hasList = linked.length > 0;
  // The API's answer; an older API doesn't give one, so: nothing linked.
  const canDelete = Boolean(impact) && (impact?.canDelete ?? !hasList);
  const blocked = Boolean(impact) && !canDelete;

  return (
    <>
      <Dialog.Header>
        <Dialog.Title>
          <Text textStyle="large-bold" color="gray.500">
            Delete invoice?
          </Text>
        </Dialog.Title>
      </Dialog.Header>
      <Dialog.Body maxH="65vh" overflowY="auto">
        <Stack gap="3">
          {isLoading && (
            <Center py="4">
              <Spinner size="sm" color="gray.300" />
            </Center>
          )}

          {isError && (
            <Flex align="center" justify="space-between" gap="3">
              <Text fontSize="13px" color="error.300">
                We couldn't check what is linked to this invoice.
              </Text>
              <Button size="xs" variant="outline" onClick={() => refetch()}>
                Try again
              </Button>
            </Flex>
          )}

          {blocked && !hasList && (
            <Text textStyle="small-regular" color="gray.400">
              {impact?.blocked?.message ??
                `${target.invoiceNumber} can't be deleted right now.`}
            </Text>
          )}

          {blocked && hasList && (
            <>
              <Text textStyle="small-regular" color="gray.400">
                <Text as="span" fontWeight="600" color="gray.500">
                  {target.invoiceNumber}
                </Text>{" "}
                has {linked.length === 1 ? "a record" : "records"} linked to it.
                Open {linked.length === 1 ? "it" : "each one"} to remove or
                delete {linked.length === 1 ? "it" : "them"}, then come back to
                delete the invoice.
              </Text>
              {linked.map((record) => (
                <LinkedRow key={record.key} record={record} onView={view} />
              ))}
            </>
          )}

          {impact && canDelete && (
            <>
              <Text textStyle="small-regular" color="gray.400">
                Invoice{" "}
                <Text as="span" fontWeight="600" color="gray.500">
                  {target.invoiceNumber}
                </Text>{" "}
                will be removed from your invoices. This can't be undone.
              </Text>
              {expenses.length > 0 && (
                <Text fontSize="12px" color="gray.400">
                  {expenses.length === 1
                    ? "1 expense"
                    : `${expenses.length} expenses`}{" "}
                  ({money(sum(expenses.map((e) => e.amount)))}) stay on your
                  records, no longer linked to this invoice.
                  {jobCard
                    ? ` They still count as a cost on job ${jobCard.jobNumber}.`
                    : ""}
                </Text>
              )}
              {jobCard && (
                <Text fontSize="12px" color="gray.400">
                  It will be taken off job {jobCard.jobNumber}.
                </Text>
              )}
              {impact.carries.length > 0 && (
                <Text fontSize="12px" color="gray.400">
                  {impact.carries.map((c) => c.invoiceNumber).join(", ")}{" "}
                  brought forward on this invoice will stay unpaid, and can be
                  brought forward again.
                </Text>
              )}
            </>
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
            {blocked ? "Close" : "Cancel"}
          </Button>
          {/* Not offered while anything is linked: there's nothing to press. */}
          {!blocked && (
            <Button
              size="sm"
              bg="red.500"
              color="white"
              _hover={{ bg: "red.600" }}
              onClick={confirmDelete}
              loading={isDeleting}
              loadingText="Deleting..."
              // Only on a fresh answer that says it can go.
              disabled={!canDelete || isFetching}
            >
              Delete invoice
            </Button>
          )}
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
          <Dialog.Content maxW="560px">
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
