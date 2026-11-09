import { useMemo } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PlanFeatureGate } from "@/features/billing/components/PlanLock";
import { RouteConstants } from "@/shared/constants/routes";
import {
  useCreateRecurringExpenseMutation,
  useGetRecurringExpenseByIdQuery,
  useUpdateRecurringExpenseMutation,
} from "../api/query";
import {
  RecurringExpenseForm,
  emptyRecurringValues,
  scheduleToValues,
  toCreatePayload,
  toUpdatePayload,
  type RecurringExpenseFormValues,
} from "../components/RecurringExpenseForm";

/** "Make this repeat" passes the expense's details here. */
export interface RecurringPrefillState {
  prefill?: Partial<RecurringExpenseFormValues>;
}

function Heading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Box>
      <Text textStyle="h3-bold" color="gray.500">
        {title}
      </Text>
      <Text textStyle="small-regular" color="gray.300" mt="1">
        {subtitle}
      </Text>
    </Box>
  );
}

export function CreateRecurringExpenseTemplate() {
  const navigate = useNavigate();
  const location = useLocation();
  const prefill = (location.state as RecurringPrefillState | null)?.prefill;
  const initialValues = useMemo(
    () => ({ ...emptyRecurringValues(), ...prefill }),
    // Read once: the form owns the values after that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const { mutateAsync, isPending } = useCreateRecurringExpenseMutation();
  const back = () => navigate(RouteConstants.expenses.recurring.path);

  return (
    <PlanFeatureGate feature="recurringExpenses">
      <Stack gap="6">
        <Flex justify="space-between" align="center" gap="3">
          <Heading
            title="New Recurring Expense"
            subtitle="Set a regular cost up once. It's recorded on every date it's due"
          />
          <Button variant="outline" size="sm" onClick={back}>
            Cancel
          </Button>
        </Flex>
        <RecurringExpenseForm
          initialValues={initialValues}
          isSubmitting={isPending}
          onCancel={back}
          onSubmit={async (values) => {
            const { data } = await mutateAsync(toCreatePayload(values));
            navigate(
              RouteConstants.expenses.recurringDetail.generate({ id: data.id }),
            );
          }}
        />
      </Stack>
    </PlanFeatureGate>
  );
}

export function EditRecurringExpenseTemplate() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading } = useGetRecurringExpenseByIdQuery(id);
  const schedule = data?.data;
  const initialValues = useMemo(
    () => (schedule ? scheduleToValues(schedule) : null),
    // Only the first copy: a refetch mid-edit mustn't reset the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [schedule?.id],
  );
  const { mutateAsync, isPending } = useUpdateRecurringExpenseMutation();
  const toDetail = () =>
    navigate(RouteConstants.expenses.recurringDetail.generate({ id }));

  if (isLoading || !initialValues || !schedule) {
    return (
      <Center py="20">
        {isLoading ? (
          <Spinner color="primary.400" />
        ) : (
          <Text color="red.500">Recurring expense not found.</Text>
        )}
      </Center>
    );
  }

  if (schedule.status === "STOPPED") {
    return (
      <Center py="20">
        <Stack gap="3" align="center" textAlign="center" maxW="26rem">
          <Text textStyle="large-bold" color="gray.500">
            {schedule.name} has been stopped
          </Text>
          <Text textStyle="small-regular" color="gray.300">
            A stopped schedule can't be changed. Set up a new one instead.
          </Text>
          <Button size="sm" variant="outline" onClick={toDetail}>
            Back
          </Button>
        </Stack>
      </Center>
    );
  }

  return (
    <Stack gap="6">
      <Flex justify="space-between" align="center" gap="3">
        <Heading
          title={`Edit ${schedule.name}`}
          subtitle={
            schedule.status === "FINISHED"
              ? "It has finished. Give it a later end or more times to start it again"
              : "Changes apply from now on"
          }
        />
        <Button variant="outline" size="sm" onClick={toDetail}>
          Cancel
        </Button>
      </Flex>
      <RecurringExpenseForm
        isEdit
        initialValues={initialValues}
        isSubmitting={isPending}
        onCancel={toDetail}
        onSubmit={async (values) => {
          await mutateAsync({
            id,
            payload: toUpdatePayload(values, initialValues),
          });
          toDetail();
        }}
      />
    </Stack>
  );
}
