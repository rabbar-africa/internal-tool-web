import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateExpensePayload } from "@/shared/interface/expense";
import { useCreateExpenseMutation } from "../api/query";
import { ExpenseForm } from "../components/ExpenseForm";

export function CreateExpenseTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Set when arriving from a job card's expense tab.
  const jobCardId = searchParams.get("jobCardId") ?? "";
  const { mutateAsync: createExpense, isPending } = useCreateExpenseMutation();

  const backPath = jobCardId
    ? RouteConstants.jobCards.detail.generate({ id: jobCardId })
    : RouteConstants.expenses.base.path;

  const handleSubmit = async (payload: CreateExpensePayload) => {
    await createExpense(payload);
    navigate(
      payload.jobCardId
        ? RouteConstants.jobCards.detail.generate({ id: payload.jobCardId })
        : RouteConstants.expenses.base.path,
    );
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
            Add Expense
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            Record a cost incurred by the workshop
          </Text>
        </Box>
        <Button variant="outline" size="sm" onClick={() => navigate(backPath)}>
          Cancel
        </Button>
      </Flex>

      <ExpenseForm
        defaultJobCardId={jobCardId}
        isSubmitting={isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate(backPath)}
      />
    </Stack>
  );
}
