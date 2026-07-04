import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreatePaymentTemplate } from "../template/CreatePaymentTemplate";

export function CreatePaymentPage() {
  return (
    <>
      <Head title="Record Payment" description="Record a payment received" />
      <UserDashboardContainer py="1.5rem">
        <CreatePaymentTemplate />
      </UserDashboardContainer>
    </>
  );
}
