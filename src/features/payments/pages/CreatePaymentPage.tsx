import { Head } from "@/components/seo/head";
import { CreatePayment } from "../components/create-payment/CreatePayment";

export function CreatePaymentPage() {
  return (
    <>
      <Head title="Record Payment" description="Record a payment received" />
      <CreatePayment />
    </>
  );
}
