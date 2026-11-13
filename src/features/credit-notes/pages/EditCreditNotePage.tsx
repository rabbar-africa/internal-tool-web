import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditCreditNoteTemplate } from "../template/EditCreditNoteTemplate";

export function EditCreditNotePage() {
  return (
    <>
      <Head title="Edit Credit Note" description="Edit a credit note" />
      <UserDashboardContainer py="1.5rem">
        <EditCreditNoteTemplate />
      </UserDashboardContainer>
    </>
  );
}
