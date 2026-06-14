import { Head } from "@/components/seo/head";
import { CreateExpensePage } from "../components/create-expense/CreateExpensePage";

export function CreateExpense() {
  return (
    <>
      <Head title="Add Expense" description="Record a new business expense" />
      <CreateExpensePage />
    </>
  );
}
