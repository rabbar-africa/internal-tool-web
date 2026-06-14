import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { PaymentDetail } from "../components/payment-detail/PaymentDetail";

export function PaymentDetailPage() {
  return (
    <>
      <Head title="Payment Receipt" description="View payment details" />
      <UserDashboardContainer py="1.5rem">
        <PaymentDetail />
      </UserDashboardContainer>
    </>
  );
}
