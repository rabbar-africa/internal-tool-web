import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { BulkExpenseTemplate } from "../template/BulkExpenseTemplate";

export function BulkExpensePage() {
  return (
    <>
      <Head
        title="Add Several Expenses"
        description="Record several business expenses at once"
      />
      <UserDashboardContainer py="1.5rem">
        <BulkExpenseTemplate />
      </UserDashboardContainer>
    </>
  );
}
