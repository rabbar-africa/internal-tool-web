import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { PaymentDetail } from "../components/payment-detail/PaymentDetail";
import { ForceDesktopView } from "@/components/common";

export function PaymentDetailPage() {
  return (
    <>
      <Head title="Payment Receipt" description="View payment details" />
      <ForceDesktopView />

      <UserDashboardContainer py="1.5rem">
        <PaymentDetail />
      </UserDashboardContainer>
    </>
  );
}
