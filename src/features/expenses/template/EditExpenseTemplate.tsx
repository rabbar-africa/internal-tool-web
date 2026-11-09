import { Box, Button, Flex, Link, Stack, Text } from "@chakra-ui/react";
import {
  Link as RouterLink,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import { repeatStateFrom } from "@/features/recurring-expenses/utils/repeat";
import SectionLoader from "@/components/common/SectionLoader";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateExpensePayload } from "@/shared/interface/expense";
import { useGetExpenseByIdQuery, useUpdateExpenseMutation } from "../api/query";
import { ExpenseForm } from "../components/ExpenseForm";

export function EditExpenseTemplate() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  // Set when opened from a job card's expense tab: back there afterwards,
  // as creating one from there does.
  const [searchParams] = useSearchParams();
  const fromJobCardId = searchParams.get("jobCardId") ?? "";
  const backPath = fromJobCardId
    ? RouteConstants.jobCards.detail.generate(
        { id: fromJobCardId },
        { tab: "expenses" },
      )
    : RouteConstants.expenses.base.path;
  const { data, isLoading } = useGetExpenseByIdQuery(id ?? "");
  const { mutateAsync: updateExpense, isPending } = useUpdateExpenseMutation();

  const expense = data?.data;

  if (isLoading) return <SectionLoader />;
  if (!expense) {
    return <Text color="gray.400">Expense not found.</Text>;
  }

  const handleSubmit = async (payload: CreateExpensePayload) => {
    await updateExpense({ id: expense.id, payload });
    navigate(backPath);
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
          {expense.recurringExpense && (
            <Text fontSize="13px" color="gray.400" mt="1">
              Recorded by{" "}
              <Link asChild color="primary.300">
                <RouterLink
                  to={RouteConstants.expenses.recurringDetail.generate({
                    id: expense.recurringExpense.id,
                  })}
                >
                  🔁 {expense.recurringExpense.name}
                </RouterLink>
              </Link>
            </Text>
          )}
        </Box>
        <Flex gap="2" wrap="wrap">
          {/* Overheads only: a job's costs don't repeat on a schedule. */}
          {!expense.recurringExpense &&
            !expense.jobCardId &&
            !expense.invoiceId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(RouteConstants.expenses.recurringCreate.path, {
                    state: repeatStateFrom(expense),
                  })
                }
              >
                🔁 Make this repeat
              </Button>
            )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(backPath)}
          >
            Cancel
          </Button>
        </Flex>
      </Flex>

      <ExpenseForm
        expense={expense}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backPath)}
      />
    </Stack>
  );
}
