import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditRecurringExpenseTemplate } from "../template/RecurringExpenseFormTemplate";

export function EditRecurringExpensePage() {
  return (
    <>
      <Head
        title="Edit Recurring Expense"
        description="Costs that come round again"
      />
      <UserDashboardContainer py="1.5rem">
        <EditRecurringExpenseTemplate />
      </UserDashboardContainer>
    </>
  );
}
