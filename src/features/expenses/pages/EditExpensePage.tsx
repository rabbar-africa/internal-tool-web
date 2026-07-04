import { Head } from "@/components/seo/head";
import { UserDashboardContainer } from "@/components/hoc";
import { EditExpenseTemplate } from "../template/EditExpenseTemplate";

export function EditExpensePage() {
  return (
    <>
      <Head title="Edit Expense" description="Update expense details" />
      <UserDashboardContainer py="1.5rem">
        <EditExpenseTemplate />
      </UserDashboardContainer>
    </>
  );
}
