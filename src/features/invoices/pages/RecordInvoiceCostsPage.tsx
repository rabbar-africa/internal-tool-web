import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { RecordInvoiceCostsTemplate } from "../template/RecordInvoiceCostsTemplate";

export function RecordInvoiceCostsPage() {
  return (
    <>
      <Head
        title="Record Costs"
        description="Record what was spent to do the job on an invoice"
      />
      <UserDashboardContainer py="1.5rem">
        <RecordInvoiceCostsTemplate />
      </UserDashboardContainer>
    </>
  );
}
