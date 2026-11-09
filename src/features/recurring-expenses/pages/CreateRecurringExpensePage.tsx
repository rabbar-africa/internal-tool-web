import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateRecurringExpenseTemplate } from "../template/RecurringExpenseFormTemplate";

export function CreateRecurringExpensePage() {
  return (
    <>
      <Head
        title="New Recurring Expense"
        description="Costs that come round again"
      />
      <UserDashboardContainer py="1.5rem">
        <CreateRecurringExpenseTemplate />
      </UserDashboardContainer>
    </>
  );
}
