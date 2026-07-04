import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import SectionLoader from "@/components/common/SectionLoader";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateExpensePayload } from "@/shared/interface/expense";
import { useGetExpenseByIdQuery, useUpdateExpenseMutation } from "../api/query";
import { ExpenseForm } from "../components/ExpenseForm";

export function EditExpenseTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetExpenseByIdQuery(id ?? "");
  const { mutateAsync: updateExpense, isPending } = useUpdateExpenseMutation();

  const expense = data?.data;

  if (isLoading) return <SectionLoader />;
  if (!expense) {
    return <Text color="gray.400">Expense not found.</Text>;
  }

  const handleSubmit = async (payload: CreateExpensePayload) => {
    await updateExpense({ id: expense.id, payload });
    navigate(RouteConstants.expenses.base.path);
  };

  return (
    <Stack gap="6">
      <Flex
        justify="space-between"
        align={{ base: "flex-start", sm: "center" }}
        direction={{ base: "column", sm: "row" }}
        gap="3"
      >
        <Box>
          <Text textStyle="h3-bold" color="gray.500">
            Edit {expense.expenseNumber}
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Update the expense details
          </Text>
        </Box>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate(RouteConstants.expenses.base.path)}
        >
          Cancel
        </Button>
      </Flex>

      <ExpenseForm
        expense={expense}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(RouteConstants.expenses.base.path)}
      />
    </Stack>
  );
}
