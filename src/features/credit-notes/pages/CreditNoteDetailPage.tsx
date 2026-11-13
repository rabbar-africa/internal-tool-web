import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreditNoteDetailTemplate } from "../template/CreditNoteDetailTemplate";

export function CreditNoteDetailPage() {
  return (
    <>
      <Head title="Credit Note" description="View a credit note" />
      <UserDashboardContainer py="1.5rem">
        <CreditNoteDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
