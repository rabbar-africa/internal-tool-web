import { Box, Button, Flex, Stack, Text } from "@chakra-ui/react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { RouteConstants } from "@/shared/constants/routes";
import type { CreateExpensePayload } from "@/shared/interface/expense";
import { useCreateExpenseMutation } from "../api/query";
import { ExpenseForm } from "../components/ExpenseForm";
import { toaster } from "@/components/ui";
import { repeatStateFrom } from "@/features/recurring-expenses/utils/repeat";

export function CreateExpenseTemplate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // Set when arriving from a job card's expense tab.
  const jobCardId = searchParams.get("jobCardId") ?? "";
  const { mutateAsync: createExpense, isPending } = useCreateExpenseMutation();

  const backPath = jobCardId
    ? RouteConstants.jobCards.detail.generate(
        { id: jobCardId },
        { tab: "expenses" },
      )
    : RouteConstants.expenses.base.path;

  const handleSubmit = async (payload: CreateExpensePayload) => {
    const { data: saved } = await createExpense(payload);
    // An overhead (no job card or invoice) may well come round again.
    if (saved && !saved.jobCardId && !saved.invoiceId) {
      toaster.create({
        type: "info",
        description: "Does this come round again, like rent or a salary?",
        action: {
          label: "Make this repeat",
          onClick: () =>
            navigate(RouteConstants.expenses.recurringCreate.path, {
              state: repeatStateFrom(saved),
            }),
        },
        duration: 10_000,
      });
    }
    // A linked invoice decides the job card server-side, so `payload` may not
    // name one even when they arrived from a job card.
    const returnJobCardId = payload.jobCardId ?? jobCardId;
    navigate(
      returnJobCardId
        ? RouteConstants.jobCards.detail.generate(
            { id: returnJobCardId },
            { tab: "expenses" },
          )
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
            Record a cost incurred by the business
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
