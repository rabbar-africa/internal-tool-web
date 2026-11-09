import { useState } from "react";
import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  IconButton,
  Link,
  Menu,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { ThreeDotsIcon } from "@/assets/custom/ThreeDotsIcon";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
import { CustomBreadCrumb } from "@/components/elements/custom-breadcrumb";
import ConsentDialog from "@/components/common/ConsentDialog";
import { toaster } from "@/components/ui";
import { PlanFeatureNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { formatAccountLabel } from "@/features/settings/components/account-details/AccountSelect";
import { usePermissions } from "@/hooks/usePermissions";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import {
  EXPENSE_CATEGORY_LABELS,
  PAYMENT_MODE_LABELS,
} from "@/shared/interface/expense";
import type { RecurringAction } from "../api/service";
import {
  useChangeRecurringExpenseMutation,
  useDeleteRecurringExpenseMutation,
  useGetRecurringExpenseByIdQuery,
} from "../api/query";
import { RecurringStatusBadge } from "../components/RecurringStatusBadge";
import { formatDay, recurringActions } from "../utils/recurring";

/** One small size for the header's buttons, so they line up with the ⋯ menu. */
const HEADER_BUTTON = { h: "2rem", px: "3", fontSize: "13px" } as const;

type Confirm = Exclude<RecurringAction, "pause"> | "delete" | null;

const DONE: Record<RecurringAction, string> = {
  pause: "Paused. Nothing is recorded until you resume it",
  resume: "Resumed",
  stop: "Stopped",
  "run-now": "Recorded today",
};

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box>
      <Text
        fontSize="11px"
        fontWeight="600"
        color="gray.300"
        textTransform="uppercase"
        letterSpacing="0.05em"
      >
        {label}
      </Text>
      <Text fontSize="14px" color="gray.500" mt="1">
        {value}
      </Text>
    </Box>
  );
}

export function RecurringExpenseDetailTemplate() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const { has } = usePermissions();
  const { hasFeature } = usePlanAccess();
  const { data, isLoading, refetch } = useGetRecurringExpenseByIdQuery(id);
  const change = useChangeRecurringExpenseMutation();
  const remove = useDeleteRecurringExpenseMutation();
  const [confirm, setConfirm] = useState<Confirm>(null);

  const schedule = data?.data;

  if (isLoading || !schedule) {
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

  const allowed = recurringActions(schedule.status);
  // Recording needs the plan; pausing, stopping and editing never do.
  const canRecord = hasFeature("recurringExpenses");
  const can = {
    recordNow: allowed.recordNow && canRecord && has("create:expenses"),
    pause: allowed.pause && has("update:expenses"),
    resume: allowed.resume && canRecord && has("update:expenses"),
    stop: allowed.stop && has("update:expenses"),
    edit: allowed.edit && has("update:expenses"),
    delete: has("delete:expenses"),
  };

  const run = async (action: RecurringAction) => {
    try {
      await change.mutateAsync({ id: schedule.id, action });
      toaster.create({ description: DONE[action], type: "success" });
    } catch {
      // A 409: someone moved it first. The toast says why; show it as it is.
      void refetch();
    } finally {
      setConfirm(null);
    }
  };

  const ends = schedule.endDate
    ? `On ${formatDay(schedule.endDate)}`
    : schedule.maxCount
      ? `After ${schedule.maxCount} ${schedule.maxCount === 1 ? "time" : "times"}`
      : "Never";

  return (
    <>
      <Stack gap="6">
        <Flex
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap="3"
        >
          <Stack gap="1">
            <CustomBreadCrumb
              items={[
                {
                  label: "Recurring expenses",
                  to: RouteConstants.expenses.recurring.path,
                },
                { label: schedule.name, isCurrent: true },
              ]}
            />
            <Flex align="center" gap="2" wrap="wrap">
              <Text textStyle="h3-bold" color="gray.500">
                {formatMoney(schedule.amount)}
              </Text>
              <Text fontSize="14px" color="gray.300">
                {schedule.describe}
              </Text>
            </Flex>
          </Stack>

          <Flex align="center" gap="2" wrap="wrap">
            <RecurringStatusBadge status={schedule.status} />
            {can.recordNow && (
              <Button {...HEADER_BUTTON} onClick={() => setConfirm("run-now")}>
                Record now
              </Button>
            )}
            {can.resume && (
              <Button {...HEADER_BUTTON} onClick={() => setConfirm("resume")}>
                Resume
              </Button>
            )}
            {can.edit && (
              <Button
                {...HEADER_BUTTON}
                variant="outline"
                onClick={() =>
                  navigate(
                    RouteConstants.expenses.recurringEdit.generate({
                      id: schedule.id,
                    }),
                  )
                }
              >
                {schedule.status === "FINISHED" ? "Edit to extend" : "Edit"}
              </Button>
            )}
            {(can.pause || can.stop || can.delete) && (
              <Menu.Root>
                <Menu.Trigger asChild>
                  <IconButton
                    variant="outline"
                    h="2rem"
                    minW="2rem"
                    aria-label="More actions"
                    loading={change.isPending}
                  >
                    <ThreeDotsIcon color="gray.500" />
                  </IconButton>
                </Menu.Trigger>
                <Portal>
                  <Menu.Positioner>
                    <Menu.Content minW="160px">
                      {can.pause && (
                        <Menu.Item
                          value="pause"
                          onClick={() => void run("pause")}
                        >
                          Pause
                        </Menu.Item>
                      )}
                      {can.stop && (
                        <Menu.Item
                          value="stop"
                          onClick={() => setConfirm("stop")}
                        >
                          Stop
                        </Menu.Item>
                      )}
                      {can.delete && (
                        <Menu.Item
                          value="delete"
                          color="red.500"
                          _hover={{ bg: "red.50" }}
                          onClick={() => setConfirm("delete")}
                        >
                          Delete
                        </Menu.Item>
                      )}
                    </Menu.Content>
                  </Menu.Positioner>
                </Portal>
              </Menu.Root>
            )}
          </Flex>
        </Flex>

        {schedule.status === "PAUSED" && (
          <Flex
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            direction={{ base: "column", sm: "row" }}
            gap="3"
            bg="warning.50"
            borderWidth="1px"
            borderColor="warning.100"
            rounded="lg"
            px="4"
            py="3"
          >
            <Box>
              <Text fontSize="13px" fontWeight="600" color="gray.500">
                {schedule.pausedReason
                  ? "Rabbar paused this schedule"
                  : "This schedule is paused"}
              </Text>
              <Text fontSize="13px" color="gray.400">
                {schedule.pausedReason ??
                  "Nothing is recorded until you resume it."}
              </Text>
            </Box>
            {can.resume && (
              <Button {...HEADER_BUTTON} onClick={() => setConfirm("resume")}>
                Resume
              </Button>
            )}
          </Flex>
        )}

        {!canRecord && <PlanFeatureNotice feature="recurringExpenses" />}

        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="xl"
          shadow="xs"
          p={{ base: "4", md: "6" }}
        >
          <Grid
            templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
            gap="5"
          >
            <Field label="Expense" value={schedule.name} />
            <Field
              label="Category"
              value={
                EXPENSE_CATEGORY_LABELS[schedule.category] ?? schedule.category
              }
            />
            <Field
              label="Costs a month"
              value={formatMoney(schedule.monthlyEquivalent)}
            />
            <Field label="Paid to" value={schedule.vendorName || "—"} />
            <Field
              label="Paid from"
              value={
                schedule.paidThroughAccount
                  ? formatAccountLabel(schedule.paidThroughAccount)
                  : "Default account each time"
              }
            />
            <Field
              label="How it's paid"
              value={
                schedule.paymentMode
                  ? PAYMENT_MODE_LABELS[schedule.paymentMode]
                  : "—"
              }
            />
            <Field label="Started" value={formatDay(schedule.startDate)} />
            <Field label="Ends" value={ends} />
            <Field
              label="Next"
              value={schedule.nextDate ? formatDay(schedule.nextDate) : "—"}
            />
            <Field label="Recorded so far" value={schedule.madeCount} />
          </Grid>
          {schedule.notes && (
            <Text fontSize="13px" color="gray.400" mt="5" whiteSpace="pre-wrap">
              {schedule.notes}
            </Text>
          )}
          {schedule.upcoming && schedule.upcoming.length > 0 && (
            <Box bg="gray.25" rounded="md" px="3" py="2" mt="5">
              <Text fontSize="13px" color="gray.400">
                {schedule.status === "PAUSED" ? "If resumed today: " : "Next: "}
                {schedule.upcoming.map((d) => formatDay(d)).join(", ")}…
              </Text>
            </Box>
          )}
        </Box>

        <Box
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="xl"
          shadow="xs"
          p={{ base: "4", md: "6" }}
        >
          <Flex justify="space-between" align="center" mb="3" gap="3">
            <Text fontWeight="600" color="gray.500">
              Recorded expenses
            </Text>
            {schedule.madeCount > 0 && (
              <Link asChild fontSize="13px" color="primary.300">
                <RouterLink
                  to={RouteConstants.expenses.base.generate(
                    {},
                    { recurringExpenseId: schedule.id },
                  )}
                >
                  See all
                </RouterLink>
              </Link>
            )}
          </Flex>
          {(schedule.expenses ?? []).length === 0 ? (
            <Text fontSize="13px" color="gray.300">
              Nothing recorded yet.
            </Text>
          ) : (
            <Stack gap="0">
              {schedule.expenses?.map((expense) => (
                <Flex
                  key={expense.id}
                  justify="space-between"
                  gap="3"
                  py="2.5"
                  borderTopWidth="1px"
                  borderColor="gray.75"
                  _first={{ borderTopWidth: 0 }}
                >
                  <Box>
                    <Link asChild fontSize="13px" color="primary.300">
                      <RouterLink
                        to={RouteConstants.expenses.edit.generate({
                          id: expense.id,
                        })}
                      >
                        {expense.expenseNumber}
                      </RouterLink>
                    </Link>
                    <Text fontSize="12px" color="gray.300">
                      {formatDay(expense.date)}
                      {expense.paidThroughAccount
                        ? ` · ${formatAccountLabel(expense.paidThroughAccount)}`
                        : ""}
                    </Text>
                  </Box>
                  <Text fontSize="13px" fontWeight="600" color="gray.500">
                    {formatMoney(expense.amount)}
                  </Text>
                </Flex>
              ))}
            </Stack>
          )}
          <Text fontSize="12px" color="gray.300" mt="3">
            Each one is an ordinary expense. If one wasn't paid, or was paid a
            different amount, edit or delete it.
          </Text>
        </Box>
      </Stack>

      <ConsentDialog
        open={confirm === "run-now"}
        onOpenChange={({ open }) => !open && setConfirm(null)}
        variant="info"
        heading="Record it now?"
        note={`For when you've paid early: ${formatMoney(schedule.amount)} is recorded today${
          schedule.nextDate
            ? `, and ${formatDay(schedule.nextDate)} won't record another`
            : ""
        }. The schedule carries on after that.`}
        confirmText="Record now"
        cancelText="Cancel"
        isLoading={change.isPending}
        handleSubmit={() => void run("run-now")}
      />

      <ConsentDialog
        open={confirm === "resume"}
        onOpenChange={({ open }) => !open && setConfirm(null)}
        variant="info"
        heading={`Resume ${schedule.name}?`}
        note="It carries on from the next date, today or later. Dates missed while it was paused are skipped, not recorded. If one is due today, it's recorded at once."
        confirmText="Resume"
        cancelText="Cancel"
        isLoading={change.isPending}
        handleSubmit={() => void run("resume")}
      />

      <ConsentDialog
        open={confirm === "stop"}
        onOpenChange={({ open }) => !open && setConfirm(null)}
        variant="warning"
        heading={`Stop ${schedule.name}?`}
        note="Nothing more is recorded, and a stopped schedule can't be resumed or edited. To stop for a while, pause it instead."
        confirmText="Stop"
        cancelText="Keep it"
        isLoading={change.isPending}
        handleSubmit={() => void run("stop")}
      />

      <ConsentDialog
        open={confirm === "delete"}
        onOpenChange={({ open }) => !open && setConfirm(null)}
        heading={`Delete ${schedule.name}?`}
        note="The schedule goes, and the expenses it recorded stay."
        confirmText="Delete"
        cancelText="Keep it"
        isLoading={remove.isPending}
        handleSubmit={async () => {
          await remove.mutateAsync(schedule.id);
          setConfirm(null);
          navigate(RouteConstants.expenses.recurring.path);
        }}
      />
    </>
  );
}
