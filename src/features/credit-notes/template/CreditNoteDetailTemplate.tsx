import { useState, type ReactNode } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  IconButton,
  Link,
  Menu,
  Portal,
  Separator,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import ConsentDialog from "@/components/common/ConsentDialog";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import { CustomCheckbox } from "@/components/input/CustomCheckBox";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { formatAccountLabel } from "@/features/settings/components/account-details/AccountSelect";
import type { ICreditNote } from "@/shared/interface/credit-note";
import { CreditNoteStatusBadge } from "../components/CreditNoteStatusBadge";
import { ApplyCreditDialog } from "../components/credit-note-detail/ApplyCreditDialog";
import { RefundCreditDialog } from "../components/credit-note-detail/RefundCreditDialog";
import {
  useCreditNoteDetail,
  type CreditNoteDetail,
} from "../components/credit-note-detail/useCreditNoteDetail";
import { reasonLabel } from "../utils/credit-note-status";

const formatDay = (value?: string | null) =>
  value ? moment(value).format("DD MMM YYYY") : "—";

const card = {
  bg: "white",
  rounded: ".625rem",
  borderWidth: "1px",
  borderColor: "gray.75",
  shadow: "xs",
} as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box {...card} overflow="hidden">
      <Text
        px={{ base: "4", md: "5" }}
        pt="4"
        pb="2"
        fontSize="15px"
        fontWeight="700"
        color="gray.500"
      >
        {title}
      </Text>
      {children}
    </Box>
  );
}

function Header({
  note,
  detail,
}: {
  note: ICreditNote;
  detail: CreditNoteDetail;
}) {
  const { can } = detail;
  const [menuOpen, setMenuOpen] = useState(false);
  const runAndClose = (handler: () => unknown) => async () => {
    try {
      await handler();
    } finally {
      setMenuOpen(false);
    }
  };

  return (
    <Stack gap="3">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        gap="3"
      >
        <Stack gap="1">
          <CustomBreadCrumb
            items={[
              {
                label: "Credit Notes",
                to: RouteConstants.creditNotes.base.path,
              },
              { label: note.creditNoteNumber, isCurrent: true },
            ]}
          />
          <Text textStyle="small-regular" color="gray.300">
            {formatDay(note.date)} · {reasonLabel(note.reason)}
            {note.reasonNote ? `: “${note.reasonNote}”` : ""}
          </Text>
        </Stack>

        <Flex align="center" gap="2" wrap="wrap">
          <CreditNoteStatusBadge status={note.status} />
          {can.issue && (
            <Button size="sm" onClick={() => detail.open("issue")}>
              Issue
            </Button>
          )}
          {can.apply && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => detail.open("apply")}
            >
              Apply to invoice
            </Button>
          )}
          {can.refund && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => detail.open("refund")}
            >
              Refund
            </Button>
          )}

          <Menu.Root
            open={menuOpen}
            onOpenChange={({ open }) => setMenuOpen(open)}
          >
            <Menu.Trigger asChild>
              <IconButton
                variant="outline"
                size="sm"
                aria-label="Credit note actions"
              >
                <ThreeDotsIcon color="gray.500" />
              </IconButton>
            </Menu.Trigger>
            <Portal>
              <Menu.Positioner>
                <Menu.Content minW="180px">
                  {can.edit && (
                    <Menu.Item value="edit" onClick={detail.edit}>
                      Edit
                    </Menu.Item>
                  )}
                  {detail.canShare && (
                    <Menu.Item
                      value="share-pdf"
                      closeOnSelect={false}
                      disabled={detail.isPdfBusy}
                      onSelect={() => void runAndClose(detail.sharePdf)()}
                    >
                      {detail.isPdfBusy ? "Preparing…" : "Send PDF"}
                    </Menu.Item>
                  )}
                  <Menu.Item
                    value="download-pdf"
                    closeOnSelect={false}
                    disabled={detail.isPdfBusy}
                    onSelect={() => void runAndClose(detail.downloadPdf)()}
                  >
                    {detail.isPdfBusy ? "Downloading…" : "Download PDF"}
                  </Menu.Item>
                  {(can.void || can.delete) && (
                    <Box>
                      <Menu.Separator borderColor="gray.50" />
                      {can.void && (
                        <Menu.Item
                          value="void"
                          onClick={() => detail.open("void")}
                        >
                          Void
                        </Menu.Item>
                      )}
                      {can.delete && (
                        <Menu.Item
                          value="delete"
                          color="red.500"
                          _hover={{ bg: "red.50" }}
                          onClick={() => detail.open("delete")}
                        >
                          Delete
                        </Menu.Item>
                      )}
                    </Box>
                  )}
                </Menu.Content>
              </Menu.Positioner>
            </Portal>
          </Menu.Root>
        </Flex>
      </Flex>

      <Flex gap="4" wrap="wrap" fontSize="12px" color="gray.400">
        {note.invoice && (
          <Link asChild color="primary.300">
            <RouterLink
              to={RouteConstants.invoices.detail.generate({
                id: note.invoice.id,
              })}
            >
              Credits {note.invoice.invoiceNumber}
            </RouterLink>
          </Link>
        )}
        <Text>{note.customerName ?? note.client?.displayName ?? "—"}</Text>
        {note.jobCard && (
          <Link asChild color="primary.300">
            <RouterLink
              to={RouteConstants.jobCards.detail.generate({
                id: note.jobCard.id,
              })}
            >
              Job card {note.jobCard.jobNumber}
            </RouterLink>
          </Link>
        )}
        {note.referenceNumber && <Text>Ref {note.referenceNumber}</Text>}
        {note.voidedAt && <Text>Voided {formatDay(note.voidedAt)}</Text>}
      </Flex>
    </Stack>
  );
}

export function CreditNoteDetailTemplate() {
  const detail = useCreditNoteDetail();
  const { note, can } = detail;
  const { formatMoney } = useFormatMoney();
  const [applyOnIssue, setApplyOnIssue] = useState(true);

  if (detail.isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }
  if (detail.isError || !note) {
    return (
      <Center py="20">
        <Text color="red.500">Credit note not found.</Text>
      </Center>
    );
  }

  const isVoid = note.status === "VOID";
  const creditLeft = isVoid ? 0 : Number(note.balance);
  const applications = note.applications ?? [];
  const refunds = note.refunds ?? [];
  const totals = (
    [
      ["Sub total", note.subTotal],
      ["Discount", -Number(note.discount)],
      [note.taxName ? `${note.taxName}` : "Tax", note.taxAmount],
      ["Shipping", note.shippingCharge],
      ["Adjustment", note.adjustment],
      ["Round off", note.roundOff],
    ] as [string, number | string][]
  ).filter(([label, value]) => label === "Sub total" || Number(value) !== 0);

  return (
    <>
      <Stack gap="5">
        <Header note={note} detail={detail} />

        {/* Open credit with nowhere to go yet: say what can be done with it. */}
        {note.status === "OPEN" &&
          creditLeft > 0 &&
          (can.apply || can.refund) && (
            <Flex
              align={{ base: "flex-start", sm: "center" }}
              justify="space-between"
              direction={{ base: "column", sm: "row" }}
              gap="3"
              bg="blue.50"
              borderWidth="1px"
              borderColor="blue.100"
              rounded="lg"
              px="4"
              py="3"
            >
              <Text fontSize="13px" color="blue.800">
                {formatMoney(creditLeft)} is open credit. Refund it, apply it to
                another of {note.customerName ?? "the customer"}'s invoices, or
                keep it for later.
              </Text>
            </Flex>
          )}
        {note.status === "DRAFT" && (
          <Text fontSize="13px" color="gray.400">
            A draft holds back what it credits on {note.invoice?.invoiceNumber},
            but can't be applied or refunded until it's issued.
          </Text>
        )}

        <Grid
          templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
          gap="3"
        >
          {(
            [
              ["Total", note.total, "gray.500"],
              ["Applied", note.amountApplied, "gray.500"],
              ["Refunded", note.amountRefunded, "gray.500"],
              [
                "Credit remaining",
                creditLeft,
                creditLeft > 0 ? "blue.700" : "gray.300",
              ],
            ] as [string, string | number, string][]
          ).map(([label, value, color]) => (
            <Box key={label} {...card} p="4">
              <Text fontSize="12px" color="gray.300">
                {label}
              </Text>
              <Text
                fontSize="18px"
                fontWeight="700"
                color={color}
                textDecoration={
                  isVoid && label === "Total" ? "line-through" : undefined
                }
              >
                {formatMoney(value)}
              </Text>
            </Box>
          ))}
        </Grid>

        <Section title="Credited">
          <Stack gap="0" separator={<Separator borderColor="gray.75" />}>
            {(note.lineItems ?? []).map((line) => (
              <Flex
                key={line.id}
                justify="space-between"
                gap="4"
                px={{ base: "4", md: "5" }}
                py="3"
              >
                <Box minW={0}>
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    {line.name}
                  </Text>
                  {line.description && (
                    <Text fontSize="12px" color="gray.300">
                      {line.description}
                    </Text>
                  )}
                  <Text fontSize="11px" color="gray.300">
                    {Number(line.quantity)} × {formatMoney(line.rate)}
                    {Number(line.discountAmount) > 0 &&
                      ` · less ${formatMoney(line.discountAmount)}`}
                    {Number(line.taxAmount) > 0 &&
                      ` · ${line.taxName ?? "Tax"} ${formatMoney(line.taxAmount)}`}
                  </Text>
                </Box>
                <Text fontSize="13px" fontWeight="600" color="gray.500">
                  {formatMoney(line.total)}
                </Text>
              </Flex>
            ))}
          </Stack>
          <Stack
            gap="1.5"
            px={{ base: "4", md: "5" }}
            py="4"
            borderTopWidth="1px"
            borderColor="gray.75"
            ml={{ md: "auto" }}
            maxW={{ md: "22rem" }}
            fontSize="13px"
          >
            {totals.map(([label, value]) => (
              <Flex key={label} justify="space-between" color="gray.400">
                <Text>{label}</Text>
                <Text>{formatMoney(value)}</Text>
              </Flex>
            ))}
            <Flex
              justify="space-between"
              fontWeight="700"
              fontSize="15px"
              color="gray.500"
            >
              <Text>Total credit</Text>
              <Text>{formatMoney(note.total)}</Text>
            </Flex>
          </Stack>
          {note.notes && (
            <Text
              px={{ base: "4", md: "5" }}
              pb="4"
              fontSize="12px"
              color="gray.400"
              whiteSpace="pre-wrap"
            >
              {note.notes}
            </Text>
          )}
        </Section>

        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="5">
          <Section title="Applied to invoices">
            {applications.length === 0 ? (
              <Text
                px={{ base: "4", md: "5" }}
                pb="4"
                fontSize="13px"
                color="gray.300"
              >
                Not applied to any invoice yet.
              </Text>
            ) : (
              <Stack gap="0" separator={<Separator borderColor="gray.75" />}>
                {applications.map((application) => (
                  <Flex
                    key={application.id}
                    justify="space-between"
                    align="center"
                    gap="3"
                    px={{ base: "4", md: "5" }}
                    py="3"
                  >
                    <Box>
                      <Link
                        asChild
                        fontSize="13px"
                        fontWeight="600"
                        color="primary.300"
                      >
                        <RouterLink
                          to={RouteConstants.invoices.detail.generate({
                            id: application.invoice.id,
                          })}
                        >
                          {application.invoice.invoiceNumber}
                        </RouterLink>
                      </Link>
                      <Text fontSize="11px" color="gray.300">
                        {formatDay(application.date)}
                      </Text>
                    </Box>
                    <Flex align="center" gap="3">
                      <Text fontSize="13px" fontWeight="600" color="gray.500">
                        {formatMoney(application.amount)}
                      </Text>
                      {can.removeApplication && (
                        <Button
                          size="xs"
                          variant="ghost"
                          color="error.300"
                          onClick={() =>
                            detail.requestRemoveApplication(application)
                          }
                        >
                          Remove
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            )}
          </Section>

          <Section title="Refunds">
            {refunds.length === 0 ? (
              <Text
                px={{ base: "4", md: "5" }}
                pb="4"
                fontSize="13px"
                color="gray.300"
              >
                Nothing refunded yet.
              </Text>
            ) : (
              <Stack gap="0" separator={<Separator borderColor="gray.75" />}>
                {refunds.map((refund) => (
                  <Flex
                    key={refund.id}
                    justify="space-between"
                    align="center"
                    gap="3"
                    px={{ base: "4", md: "5" }}
                    py="3"
                  >
                    <Box minW={0}>
                      <Text fontSize="13px" fontWeight="600" color="gray.500">
                        {formatDay(refund.date)}
                      </Text>
                      <Text fontSize="11px" color="gray.300">
                        {[
                          refund.mode?.replace(/_/g, " ").toLowerCase(),
                          refund.account &&
                            formatAccountLabel({
                              accountName: refund.account.accountName ?? "",
                              accountNumber: refund.account.accountNumber ?? "",
                              bankName: refund.account.bankName ?? "",
                            }),
                          refund.referenceNumber &&
                            `Ref ${refund.referenceNumber}`,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </Text>
                    </Box>
                    <Flex align="center" gap="3">
                      <Text fontSize="13px" fontWeight="600" color="gray.500">
                        {formatMoney(refund.amount)}
                      </Text>
                      {can.deleteRefund && (
                        <Button
                          size="xs"
                          variant="ghost"
                          color="error.300"
                          onClick={() => detail.requestDeleteRefund(refund)}
                        >
                          Delete
                        </Button>
                      )}
                    </Flex>
                  </Flex>
                ))}
              </Stack>
            )}
          </Section>
        </Grid>
      </Stack>

      <ApplyCreditDialog
        open={detail.dialog === "apply"}
        note={note}
        isApplying={detail.isApplying}
        onCancel={detail.close}
        onConfirm={detail.confirmApply}
      />
      <RefundCreditDialog
        open={detail.dialog === "refund"}
        note={note}
        isRefunding={detail.isRefunding}
        onCancel={detail.close}
        onConfirm={detail.confirmRefund}
      />

      <ConsentDialog
        open={detail.dialog === "issue"}
        onOpenChange={({ open }) => {
          if (!open) detail.close();
        }}
        variant="info"
        heading={`Issue ${note.creditNoteNumber}?`}
        note="Once issued it's a tax record: it can be voided, but not deleted."
        confirmText="Issue"
        cancelText="Not yet"
        isLoading={detail.isIssuing}
        handleSubmit={() => detail.confirmIssue(applyOnIssue)}
      >
        <CustomCheckbox
          checked={applyOnIssue}
          onCheckedChange={({ checked }) => setApplyOnIssue(Boolean(checked))}
          label={`Apply to ${note.invoice?.invoiceNumber ?? "its invoice"} now`}
        />
      </ConsentDialog>

      {/* Void needs nothing used; otherwise say what to undo first. */}
      <ConsentDialog
        open={detail.dialog === "void"}
        onOpenChange={({ open }) => {
          if (!open) detail.close();
        }}
        variant={detail.voidBlocked ? "info" : "danger"}
        heading={
          detail.voidBlocked
            ? `${note.creditNoteNumber} can't be voided yet`
            : `Void ${note.creditNoteNumber}?`
        }
        note={
          detail.voidBlocked
            ? "Remove its applications and refunds first."
            : "It keeps its number, and what it credited goes back on the invoice."
        }
        confirmText={detail.voidBlocked ? "OK" : "Void"}
        cancelText={detail.voidBlocked ? "Close" : "Keep it"}
        isLoading={detail.isVoiding}
        handleSubmit={detail.voidBlocked ? detail.close : detail.confirmVoid}
      />

      <ConsentDialog
        open={detail.dialog === "delete"}
        onOpenChange={({ open }) => {
          if (!open) detail.close();
        }}
        variant="danger"
        heading={`Delete ${note.creditNoteNumber}?`}
        note="Only drafts can be deleted. What it would have credited goes back on the invoice."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={detail.isDeleting}
        handleSubmit={detail.confirmDelete}
      />

      <ConsentDialog
        open={Boolean(detail.pendingApplication)}
        onOpenChange={({ open }) => {
          if (!open) detail.cancelRemoveApplication();
        }}
        variant="warning"
        heading={`Remove the credit from ${detail.pendingApplication?.invoice.invoiceNumber ?? "this invoice"}?`}
        note={`${formatMoney(detail.pendingApplication?.amount ?? 0)} goes back on ${note.creditNoteNumber}, and the invoice owes it again.`}
        confirmText="Remove"
        cancelText="Keep it"
        isLoading={detail.isRemovingApplication}
        handleSubmit={detail.confirmRemoveApplication}
      />

      <ConsentDialog
        open={Boolean(detail.pendingRefund)}
        onOpenChange={({ open }) => {
          if (!open) detail.cancelDeleteRefund();
        }}
        variant="danger"
        heading="Delete this refund?"
        note={`${formatMoney(detail.pendingRefund?.amount ?? 0)} goes back on ${note.creditNoteNumber} as credit, and comes off the account's statement.`}
        confirmText="Delete refund"
        cancelText="Keep it"
        isLoading={detail.isDeletingRefund}
        handleSubmit={detail.confirmDeleteRefund}
      />
    </>
  );
}
