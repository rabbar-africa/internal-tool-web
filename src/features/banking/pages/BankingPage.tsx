import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { BankingTemplate } from "../template/BankingTemplate";

export function BankingPage() {
  return (
    <>
      <Head
        title="Banking"
        description="Statements for each account and for the whole business"
      />
      <UserDashboardContainer py="1.5rem">
        <BankingTemplate />
      </UserDashboardContainer>
    </>
  );
}
