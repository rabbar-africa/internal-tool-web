import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { CreateExpenseTemplate } from "../template/CreateExpenseTemplate";

export function CreateExpensePage() {
  return (
    <>
      <Head title="Add Expense" description="Record a new business expense" />
      <UserDashboardContainer py="1.5rem">
        <CreateExpenseTemplate />
      </UserDashboardContainer>
    </>
  );
}
