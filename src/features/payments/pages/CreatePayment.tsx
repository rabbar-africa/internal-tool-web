import { Head } from "@/components/seo/head";
import { CreatePaymentPage } from "../components/create-payment/CreatePaymentPage";

export function CreatePayment() {
  return (
    <>
      <Head title="Record Payment" description="Record a payment received" />
      <CreatePaymentPage />
    </>
  );
}
