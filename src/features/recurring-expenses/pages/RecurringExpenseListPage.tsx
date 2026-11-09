import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { RecurringExpenseListTemplate } from "../template/RecurringExpenseListTemplate";

export function RecurringExpenseListPage() {
  return (
    <>
      <Head
        title="Recurring Expenses"
        description="Costs that come round again"
      />
      <UserDashboardContainer py="1.5rem">
        <RecurringExpenseListTemplate />
      </UserDashboardContainer>
    </>
  );
}
