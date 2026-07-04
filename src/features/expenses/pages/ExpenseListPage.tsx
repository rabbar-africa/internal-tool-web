import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { ExpenseListTemplate } from "../template/ExpenseListTemplate";

export function ExpenseListPage() {
  return (
    <>
      <Head
        title="Expense Tracking"
        description="Track all business expenses"
      />
      <UserDashboardContainer py="1.5rem">
        <ExpenseListTemplate />
      </UserDashboardContainer>
    </>
  );
}
