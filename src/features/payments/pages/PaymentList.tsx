import { Head } from "@/components/seo/head";
import { PaymentListPage } from "../components/payment-list/PaymentListPage";

export function PaymentList() {
  return (
    <>
      <Head
        title="Payments Received"
        description="Track all payments received"
      />
      <PaymentListPage />
    </>
  );
}
