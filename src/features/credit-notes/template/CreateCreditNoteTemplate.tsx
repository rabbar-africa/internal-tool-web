import { Stack } from "@chakra-ui/react";
import { useSearchParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CreditNoteForm } from "../components/credit-note-form/CreditNoteForm";
import { InvoicePicker } from "../components/credit-note-form/InvoicePicker";

export function CreateCreditNoteTemplate() {
  const [params, setParams] = useSearchParams();
  const invoiceId = params.get("invoiceId");

  return (
    <Stack gap="6">
      <PageHeader
        title="New Credit Note"
        subtitle="Credit part or all of an invoice. The invoice itself doesn't change."
      />
      {invoiceId ? (
        // Keyed so picking another invoice starts the form afresh.
        <CreditNoteForm key={invoiceId} invoiceId={invoiceId} />
      ) : (
        <InvoicePicker
          onPick={(id) => setParams({ invoiceId: id }, { replace: true })}
        />
      )}
    </Stack>
  );
}
