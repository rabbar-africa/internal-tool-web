import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { TransferListTemplate } from "../template/TransferListTemplate";

export function TransferListPage() {
  return (
    <>
      <Head
        title="Account Transfers"
        description="Cash banked, cash withdrawn and money moved between accounts"
      />
      <UserDashboardContainer py="1.5rem">
        <TransferListTemplate />
      </UserDashboardContainer>
    </>
  );
}
