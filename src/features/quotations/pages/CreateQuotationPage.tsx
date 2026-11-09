import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateQuotationTemplate } from "../template/CreateQuotationTemplate";

export function CreateQuotationPage() {
  return (
    <>
      <Head title="New Quote" description="Create a quote" />
      <UserDashboardContainer py="1.5rem">
        <CreateQuotationTemplate />
      </UserDashboardContainer>
    </>
  );
}
