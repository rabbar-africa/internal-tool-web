import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { QuotationListTemplate } from "../template/QuotationListTemplate";

export function QuotationListPage() {
  return (
    <>
      <Head title="Quotes" description="Manage your quotes" />
      <UserDashboardContainer py="1.5rem">
        <QuotationListTemplate />
      </UserDashboardContainer>
    </>
  );
}
