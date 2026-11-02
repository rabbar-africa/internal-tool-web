import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { StatementTemplate } from "../template/StatementTemplate";

export function StatementPage() {
  return (
    <>
      <Head
        title="Account Statement"
        description="Money in and out of an account, with a running balance"
      />
      <UserDashboardContainer py="1.5rem">
        <StatementTemplate />
      </UserDashboardContainer>
    </>
  );
}
