import { Head } from "@/components/seo/head";
import { CreatePayment } from "../components/create-payment/CreatePayment";
import { UserDashboardContainer } from "@/components/hoc";

export function CreatePaymentPage() {
  return (
    <>
      <Head title="Record Payment" description="Record a payment received" />
      <UserDashboardContainer py="1.5rem">
        {" "}
        <CreatePayment />
      </UserDashboardContainer>
    </>
  );
}
