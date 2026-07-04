import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { PaymentDetailTemplate } from "../template/PaymentDetailTemplate";
import { ForceDesktopView } from "@/components/common";

export function PaymentDetailPage() {
  return (
    <>
      <Head title="Payment Receipt" description="View payment details" />
      <ForceDesktopView />
      <UserDashboardContainer py="1.5rem">
        <PaymentDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
