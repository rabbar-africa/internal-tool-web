import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreditNoteListTemplate } from "../template/CreditNoteListTemplate";

export function CreditNoteListPage() {
  return (
    <>
      <Head title="Credit Notes" description="Manage your credit notes" />
      <UserDashboardContainer py="1.5rem">
        <CreditNoteListTemplate />
      </UserDashboardContainer>
    </>
  );
}
