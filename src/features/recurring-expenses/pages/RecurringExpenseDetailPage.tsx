import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { RecurringExpenseDetailTemplate } from "../template/RecurringExpenseDetailTemplate";

export function RecurringExpenseDetailPage() {
  return (
    <>
      <Head
        title="Recurring Expense"
        description="Costs that come round again"
      />
      <UserDashboardContainer py="1.5rem">
        <RecurringExpenseDetailTemplate />
      </UserDashboardContainer>
    </>
  );
}
