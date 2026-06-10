import { Head } from "@/components/seo/head";
import { PaymentListPage } from "../components/payment-list/PaymentListPage";
import { UserDashboardContainer } from "@/components/hoc";

export function PaymentList() {
  return (
    <>
      <Head
        title="Payments Received"
        description="Track all payments received"
      />

      <UserDashboardContainer py="1.5rem">
        <PaymentListPage />
      </UserDashboardContainer>
    </>
  );
}
