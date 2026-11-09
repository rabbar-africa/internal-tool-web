import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { QuotationDetailTemplate } from "../template/QuotationDetailTemplate";

export function QuotationDetailPage() {
  return (
    <>
      <Head title="Quote" description="View a quote" />
      <UserDashboardContainer py="1.5rem">
        <QuotationDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
