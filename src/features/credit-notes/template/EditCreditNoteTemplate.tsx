import { Button, Center, Spinner, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetCreditNoteByIdQuery } from "../api/query";
import { CreditNoteForm } from "../components/credit-note-form/CreditNoteForm";
import { creditNoteActions } from "../utils/credit-note-status";

export function EditCreditNoteTemplate() {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { data, isLoading } = useGetCreditNoteByIdQuery(id);
  const note = data?.data;

  if (isLoading) {
    return (
      <Center py="20">
        <Spinner color="primary.400" />
      </Center>
    );
  }

  // Closed and void notes are locked; the API would refuse the save.
  if (!note || !creditNoteActions(note).edit) {
    return (
      <Center py="20">
        <Stack gap="3" align="center" textAlign="center" maxW="26rem">
          <Text textStyle="large-bold" color="gray.500">
            {note
              ? `${note.creditNoteNumber} can't be edited`
              : "Credit note not found"}
          </Text>
          {note && (
            <Text textStyle="small-regular" color="gray.300">
              {note.status === "CLOSED"
                ? "All of its credit has been used. Remove an application or refund first."
                : "It has been voided."}
            </Text>
          )}
          <Button
            size="sm"
            onClick={() =>
              navigate(
                note
                  ? RouteConstants.creditNotes.detail.generate({ id: note.id })
                  : RouteConstants.creditNotes.base.path,
              )
            }
          >
            Back
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="6">
      <PageHeader
        title={`Edit ${note.creditNoteNumber}`}
        subtitle={
          Number(note.amountApplied) + Number(note.amountRefunded) > 0
            ? "Its total can't go below what's already applied and refunded."
            : "Change what it credits. The invoice itself doesn't change."
        }
      />
      <CreditNoteForm invoiceId={note.invoiceId} note={note} />
    </Stack>
  );
}
