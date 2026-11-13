import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateCreditNoteTemplate } from "../template/CreateCreditNoteTemplate";

export function CreateCreditNotePage() {
  return (
    <>
      <Head title="New Credit Note" description="Credit an invoice" />
      <UserDashboardContainer py="1.5rem">
        <CreateCreditNoteTemplate />
      </UserDashboardContainer>
    </>
  );
}
