import { useState } from "react";
import {
  Button,
  Center,
  Dialog,
  Flex,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  ImpactBox,
  ImpactError,
  RecordLink,
  TickOption,
  capitalise,
  countOf,
  listOf,
} from "@/components/common/delete-impact";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type { JobCardDeleteImpact } from "@/shared/interface/job-card";
import {
  useDeleteJobCardMutation,
  useGetJobCardDeleteImpactQuery,
  useUpdateJobCardStatusMutation,
} from "../api/query";

export interface JobCardDeleteTarget {
  id: string;
  jobNumber: string;
}

interface DeleteJobCardDialogProps {
  target: JobCardDeleteTarget | null;
  onClose: () => void;
  /** After deleting: the detail page leaves, the list just closes. */
  onDeleted: () => void;
}

/** Money is on the job: no delete, but a way to close it instead. */
function Blocked({ impact }: { impact: JobCardDeleteImpact }) {
  const blocked = impact.blocked!;
  return (
    <ImpactBox title="This job card can't be deleted" tone="warning">
      <Text>{blocked.message}</Text>
      {blocked.invoices.length > 0 && (
        <Text mt="2">
          Invoices:{" "}
          {blocked.invoices.map((inv, i) => (
            <span key={inv.id}>
              {i > 0 && ", "}
              <RecordLink
                to={RouteConstants.invoices.detail.generate({ id: inv.id })}
              >
                {inv.invoiceNumber}
              </RecordLink>{" "}
              ({inv.status.toLowerCase().replace(/_/g, " ")})
            </span>
          ))}
        </Text>
      )}
      {blocked.payments.length > 0 && (
        <Text mt="1">
          Payments:{" "}
          {blocked.payments.map((p, i) => (
            <span key={p.id}>
              {i > 0 && ", "}
              <RecordLink
                to={RouteConstants.payments.detail.generate({ id: p.id })}
              >
                {p.paymentNumber}
              </RecordLink>
            </span>
          ))}
        </Text>
      )}
    </ImpactBox>
  );
}

/** Mounted per job card, so the ticks never carry over to the next one. */
function DeleteJobCardContent({
  target,
  onClose,
  onDeleted,
}: DeleteJobCardDialogProps & { target: JobCardDeleteTarget }) {
  const { formatMoney } = useFormatMoney();
  const { canUpdate } = usePermissions();
  const { data, isLoading, isError, refetch } = useGetJobCardDeleteImpactQuery(
    target.id,
  );
  const { mutateAsync: deleteJobCard, isPending: isDeleting } =
    useDeleteJobCardMutation();
  const { mutateAsync: updateStatus, isPending: isCancelling } =
    useUpdateJobCardStatusMutation();
  const [deleteExpenses, setDeleteExpenses] = useState(false);
  const [deleteInspections, setDeleteInspections] = useState(false);

  const impact = data?.data;
  const busy = isDeleting || isCancelling;
  const canMarkCancelled =
    Boolean(impact?.blocked) &&
    Boolean(impact?.canCancel) &&
    canUpdate("job_cards");

  const confirmDelete = async () => {
    try {
      await deleteJobCard({
        id: target.id,
        options: { deleteExpenses, deleteInspections },
      });
      onDeleted();
    } catch {
      // The error is already toasted. A 409 means money was added meanwhile:
      // ask again, so the modal shows why it can't be deleted.
      void refetch();
    }
  };

  const markCancelled = async () => {
    await updateStatus({ id: target.id, status: "CANCELLED" });
    onClose();
  };

  const expenses = impact?.expenses.direct ?? [];
  const inspections = impact?.inspections ?? [];
  const expensesTotal = formatMoney(
    expenses.reduce((sum, e) => sum + e.amount, 0),
  );

  const deletedWithIt = impact
    ? listOf([
        countOf(impact.files, "file", "files"),
        countOf(
          impact.technicians,
          "technician assignment",
          "technician assignments",
        ),
      ])
    : "";

  const draftInvoices =
    impact?.invoices.filter((i) => i.status === "DRAFT").length ?? 0;
  const voidInvoices = (impact?.invoices.length ?? 0) - draftInvoices;
  const kept = impact
    ? listOf([
        countOf(draftInvoices, "draft invoice", "draft invoices"),
        countOf(voidInvoices, "void invoice", "void invoices"),
        countOf(impact.payments.length, "draft payment", "draft payments"),
        countOf(impact.quotations.length, "quote", "quotes"),
        countOf(impact.creditNotes.length, "credit note", "credit notes"),
      ])
    : "";
  const viaInvoice = impact?.expenses.viaInvoice ?? 0;

  return (
    <>
      <Dialog.Header>
        <Dialog.Title textStyle="h5-semibold" color="gray.500">
          Delete job card {target.jobNumber}?
        </Dialog.Title>
      </Dialog.Header>

      <Dialog.Body>
        {isLoading ? (
          <Center py="6">
            <Spinner size="sm" color="gray.300" />
          </Center>
        ) : isError || !impact ? (
          <ImpactError
            message="We couldn't check what is on this job card."
            onRetry={() => void refetch()}
          />
        ) : impact.blocked ? (
          <Stack gap="3">
            <Blocked impact={impact} />
            {canMarkCancelled && (
              <Text textStyle="small-regular" color="gray.400">
                Marking it as Cancelled closes the job and keeps its records.
              </Text>
            )}
          </Stack>
        ) : (
          <Stack gap="3">
            <Text textStyle="small-regular" color="gray.400">
              This can&rsquo;t be undone.
            </Text>

            {deletedWithIt && (
              <ImpactBox title="Deleted with it" tone="error">
                {capitalise(deletedWithIt)}.
              </ImpactBox>
            )}

            {(kept || viaInvoice > 0) && (
              <ImpactBox title="Kept, no longer linked to this job">
                {kept && <Text>{capitalise(kept)}.</Text>}
                {viaInvoice > 0 && (
                  <Text mt={kept ? "1" : "0"}>
                    {countOf(viaInvoice, "expense", "expenses")} on its invoices
                    stay with those invoices.
                  </Text>
                )}
              </ImpactBox>
            )}

            {expenses.length > 0 && (
              <TickOption
                label={`Also delete the ${countOf(
                  expenses.length,
                  "expense",
                  "expenses",
                )} recorded on this job (${expensesTotal})`}
                checked={deleteExpenses}
                onChange={setDeleteExpenses}
                disabled={!impact.can.deleteExpenses}
                disabledHint="You don't have permission to delete expenses. They stay as general spending."
                hint={
                  deleteExpenses
                    ? `${expensesTotal} will be removed from your expenses, account statements and profit figures.`
                    : "Unticked, they stay as general spending."
                }
              />
            )}

            {inspections.length > 0 && (
              <TickOption
                label={`Also delete the ${countOf(
                  inspections.length,
                  "inspection",
                  "inspections",
                )}, with their photos and PDFs`}
                checked={deleteInspections}
                onChange={setDeleteInspections}
                disabled={!impact.can.deleteInspections}
                disabledHint="You don't have permission to delete inspections. They stay as part of the vehicle's history."
                hint={
                  deleteInspections
                    ? "Their photos and PDFs are deleted too."
                    : "Unticked, they stay as part of the vehicle's history."
                }
              />
            )}
          </Stack>
        )}
      </Dialog.Body>

      <Dialog.Footer>
        <Flex gap="2" justify="flex-end" w="full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
            {impact?.blocked ? "Close" : "Cancel"}
          </Button>
          {impact?.blocked ? (
            canMarkCancelled && (
              <Button
                size="sm"
                loading={isCancelling}
                onClick={() => void markCancelled()}
              >
                Mark as Cancelled
              </Button>
            )
          ) : (
            <Button
              size="sm"
              bg="error.300"
              color="white"
              _hover={{ bg: "error.400" }}
              loading={isDeleting}
              loadingText="Deleting..."
              // Nobody confirms without seeing what is attached.
              disabled={!impact}
              onClick={() => void confirmDelete()}
            >
              Delete
            </Button>
          )}
        </Flex>
      </Dialog.Footer>
    </>
  );
}

/**
 * Asks the API what deleting the job card touches before anyone confirms. A
 * job with money on it can't be deleted; it's offered Cancelled instead.
 */
export function DeleteJobCardDialog(props: DeleteJobCardDialogProps) {
  const { target, onClose } = props;
  return (
    <Dialog.Root
      open={Boolean(target)}
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      placement="center"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="32rem">
            {target && (
              <DeleteJobCardContent
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
