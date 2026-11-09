import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateQuotationTemplate } from "../template/CreateQuotationTemplate";

export function EditQuotationPage() {
  return (
    <>
      <Head title="Edit Quote" description="Edit a quote" />
      <UserDashboardContainer py="1.5rem">
        <CreateQuotationTemplate mode="edit" />
      </UserDashboardContainer>
    </>
  );
}
