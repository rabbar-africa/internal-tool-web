import { Head } from "@/components/seo/head";
import { ExpenseListPage } from "../components/expense-list/ExpenseListPage";

export function ExpenseList() {
  return (
    <>
      <Head
        title="Expense Tracking"
        description="Track all business expenses"
      />
      <ExpenseListPage />
    </>
  );
}
