import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { PaymentListTemplate } from "../template/PaymentListTemplate";

export function PaymentListPage() {
  return (
    <>
      <Head
        title="Payments Received"
        description="Track all payments received"
      />
      <UserDashboardContainer py="1.5rem">
        <PaymentListTemplate />
      </UserDashboardContainer>
    </>
  );
}
