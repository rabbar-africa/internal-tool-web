import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Center,
  CloseButton,
  Dialog,
  Flex,
  Grid,
  Portal,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { PlanFeatureNotice } from "@/features/billing/components/PlanLock";
import { usePlanAccess } from "@/features/billing/hooks/usePlanAccess";
import { RouteConstants } from "@/shared/constants/routes";
import { chakraScrollbarStyle } from "@/shared/constants/styles";
import type {
  CustomerStatement,
  CustomerStatementDetail,
  CustomerStatementParams,
  CustomerStatementView,
  ICustomer,
} from "@/shared/interface/customer";
import { formatCurrency } from "@/utils/calculations";
import { getErrorMessage } from "@/utils/handle-error";
import {
  useDownloadCustomerStatementMutation,
  useGetCustomerStatementQuery,
  useGetVehiclesByClientQuery,
  type Vehicle,
} from "../../api";

type Preset = "this-month" | "last-3-months" | "this-year" | "custom";

const PERIOD_OPTIONS: { label: string; value: Preset }[] = [
  { label: "This month", value: "this-month" },
  { label: "Last 3 months", value: "last-3-months" },
  { label: "This year", value: "this-year" },
  { label: "Custom range", value: "custom" },
];

const VIEW_OPTIONS: { label: string; value: CustomerStatementView }[] = [
  { label: "Work only", value: "work" },
  { label: "Work and payments", value: "both" },
  { label: "Payments only", value: "account" },
];

const DETAIL_OPTIONS: { label: string; value: CustomerStatementDetail }[] = [
  { label: "Summary", value: "short" },
  { label: "Every item", value: "full" },
];

/** A select item can't have an empty value. */
const ALL_VEHICLES = "all";

const DAY = "YYYY-MM-DD";

function presetRange(preset: Exclude<Preset, "custom">) {
  const today = moment();
  const from =
    preset === "this-month"
      ? today.clone().startOf("month")
      : preset === "last-3-months"
        ? today.clone().subtract(3, "months")
        : today.clone().startOf("year");
  return { from: from.format(DAY), to: today.format(DAY) };
}

const vehicleLabel = (vehicle: Vehicle) =>
  [
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" "),
    vehicle.registrationNumber,
  ]
    .filter(Boolean)
    .join(" · ");

const formatDay = (day: string) =>
  moment(day.slice(0, 10)).format("DD MMM YYYY");
const plural = (count: number, word: string) =>
  `${count} ${word}${count === 1 ? "" : "s"}`;

function FigureRow({ label, value }: { label: string; value: string }) {
  return (
    <Flex justify="space-between" gap="3">
      <Text fontSize="13px" color="gray.400">
        {label}
      </Text>
      <Text fontSize="13px" fontWeight="500" color="gray.500">
        {value}
      </Text>
    </Flex>
  );
}

/** Who the PDF is for and what's in it, before it goes to the client. */
function StatementPreview({ statement }: { statement: CustomerStatement }) {
  const { activity, account, customer, period, currencyCode } = statement;
  const money = (amount: number) => formatCurrency(amount, currencyCode);
  const isEmpty = !activity.jobCount && !account?.transactions.length;

  const facts = [
    plural(activity.jobCount, "job"),
    activity.vehicleCount ? plural(activity.vehicleCount, "vehicle") : "",
    activity.firstVisit ? `First visit ${formatDay(activity.firstVisit)}` : "",
    activity.lastVisit ? `Last visit ${formatDay(activity.lastVisit)}` : "",
  ].filter(Boolean);

  return (
    <Stack gap="2">
      <Box>
        <Text fontSize="14px" fontWeight="600" color="gray.500">
          {statement.title} for {customer.name}
        </Text>
        <Text fontSize="12px" color="gray.400">
          {formatDay(period.from)} – {formatDay(period.to)}
          {statement.vehicle ? ` · ${statement.vehicle.label}` : ""}
        </Text>
      </Box>
      {isEmpty ? (
        <Text fontSize="13px" color="gray.400">
          Nothing in this period. Try a longer one.
        </Text>
      ) : (
        <Text fontSize="13px" color="gray.500">
          {facts.join(" · ")}
        </Text>
      )}
      {/* The work view has no money at all: never show it as zero. */}
      {account && (
        <Stack gap="1" pt="2" borderTopWidth="1px" borderColor="gray.75">
          <FigureRow
            label="Opening balance"
            value={money(account.summary.openingBalance)}
          />
          <FigureRow label="Billed" value={money(account.summary.billed)} />
          <FigureRow label="Paid" value={money(account.summary.paid)} />
          {account.summary.writtenOff > 0 && (
            <FigureRow
              label="Written off"
              value={money(account.summary.writtenOff)}
            />
          )}
          <FigureRow
            label={account.summary.closingBalance < 0 ? "In credit" : "Balance"}
            value={money(Math.abs(account.summary.closingBalance))}
          />
        </Stack>
      )}
    </Stack>
  );
}

interface WorkHistoryModalProps {
  customer: ICustomer;
  onClose: () => void;
}

/**
 * A customer asks for a history of their work together. Pick the period and what
 * to include, see what it will hold, and download one PDF to send them.
 */
export function WorkHistoryModal({ customer, onClose }: WorkHistoryModalProps) {
  const navigate = useNavigate();
  const { hasFeature } = usePlanAccess();
  const canUse = hasFeature("customerStatement");

  // This year by default: the API's default of this month is usually too short.
  const [preset, setPreset] = useState<Preset>("this-year");
  const [custom, setCustom] = useState(() => presetRange("this-year"));
  const [show, setShow] = useState<CustomerStatementView>("work");
  const [detail, setDetail] = useState<CustomerStatementDetail>("short");
  const [vehicleId, setVehicleId] = useState(ALL_VEHICLES);

  const { data: vehiclesData } = useGetVehiclesByClientQuery(customer.id);
  const vehicles: Vehicle[] = vehiclesData?.data ?? [];

  const range = preset === "custom" ? custom : presetRange(preset);
  const hasDates = Boolean(range.from && range.to);
  const params = useMemo<CustomerStatementParams>(
    () => ({
      from: range.from,
      to: range.to,
      show,
      detail,
      ...(vehicleId !== ALL_VEHICLES ? { vehicleId } : {}),
    }),
    [range.from, range.to, show, detail, vehicleId],
  );

  const {
    data,
    error,
    isLoading: isPreviewLoading,
    isFetching,
  } = useGetCustomerStatementQuery(customer.id, params, {
    enabled: canUse && hasDates,
  });
  const statement = data?.data;
  const { mutate: download, isPending: isDownloading } =
    useDownloadCustomerStatementMutation();

  const openUnlinkedInvoices = () => {
    onClose();
    navigate(
      `${RouteConstants.invoices.base.path}?search=${encodeURIComponent(customer.displayName)}`,
    );
  };

  const warnings = statement?.warnings;

  return (
    <Dialog.Root
      open
      onOpenChange={({ open }) => {
        if (!open) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content w="34rem" maxW="full" borderRadius="2xl" pt="2.5rem">
            <Dialog.CloseTrigger asChild>
              <CloseButton position="absolute" top="4" right="4" size="sm" />
            </Dialog.CloseTrigger>
            <Dialog.Body
              pb="6"
              overflow="auto"
              maxH="min(44.375rem, calc(100dvh - 4rem))"
              css={chakraScrollbarStyle}
            >
              <Stack gap="5">
                <Stack gap="1">
                  <Text fontSize="16px" fontWeight="600" color="gray.500">
                    Work history
                  </Text>
                  <Text fontSize="13px" color="gray.300">
                    One PDF of your work with {customer.displayName}, ready to
                    send them.
                  </Text>
                </Stack>

                {!canUse ? (
                  <PlanFeatureNotice feature="customerStatement" />
                ) : (
                  <>
                    <Grid
                      templateColumns={{ base: "1fr", sm: "1fr 1fr" }}
                      gap="4"
                    >
                      <CustomSelect
                        label="Period"
                        options={PERIOD_OPTIONS}
                        value={[preset]}
                        onChange={(opt: { value: string[] }) =>
                          setPreset((opt?.value?.[0] as Preset) ?? "this-year")
                        }
                      />
                      <CustomSelect
                        label="What to include"
                        options={VIEW_OPTIONS}
                        value={[show]}
                        onChange={(opt: { value: string[] }) =>
                          setShow(
                            (opt?.value?.[0] as CustomerStatementView) ??
                              "work",
                          )
                        }
                      />
                      <CustomSelect
                        label="Detail"
                        options={DETAIL_OPTIONS}
                        value={[detail]}
                        onChange={(opt: { value: string[] }) =>
                          setDetail(
                            (opt?.value?.[0] as CustomerStatementDetail) ??
                              "short",
                          )
                        }
                      />
                      {/* Many businesses on Rabbar don't work on vehicles. */}
                      {vehicles.length > 0 && (
                        <CustomSelect
                          label="Vehicle"
                          options={[
                            { label: "All vehicles", value: ALL_VEHICLES },
                            ...vehicles.map((vehicle) => ({
                              label: vehicleLabel(vehicle),
                              value: vehicle.id,
                            })),
                          ]}
                          value={[vehicleId]}
                          onChange={(opt: { value: string[] }) =>
                            setVehicleId(opt?.value?.[0] ?? ALL_VEHICLES)
                          }
                        />
                      )}
                    </Grid>

                    {preset === "custom" && (
                      <Flex gap="2" align="center">
                        <DateField
                          label="From"
                          value={custom.from}
                          max={custom.to || undefined}
                          onChange={(from) =>
                            setCustom((prev) => ({ ...prev, from }))
                          }
                          containerProps={{ flex: "1", minW: 0 }}
                        />
                        <DateField
                          label="To"
                          value={custom.to}
                          min={custom.from || undefined}
                          onChange={(to) =>
                            setCustom((prev) => ({ ...prev, to }))
                          }
                          containerProps={{ flex: "1", minW: 0 }}
                        />
                      </Flex>
                    )}

                    <Box
                      p="4"
                      rounded="lg"
                      bg="gray.50"
                      borderWidth="1px"
                      borderColor="gray.75"
                      minH="5rem"
                      opacity={isFetching && !isPreviewLoading ? 0.6 : 1}
                      transition="opacity 0.15s"
                    >
                      {isPreviewLoading ? (
                        <Center py="3">
                          <Spinner size="sm" color="primary.300" />
                        </Center>
                      ) : error ? (
                        <Text fontSize="13px" color="error.300">
                          {getErrorMessage(error)}
                        </Text>
                      ) : statement ? (
                        <StatementPreview statement={statement} />
                      ) : (
                        <Text fontSize="13px" color="gray.400">
                          Choose both dates to see what's in it.
                        </Text>
                      )}
                    </Box>

                    {/* Never on the PDF: they're for whoever is sending it. */}
                    {Boolean(warnings?.unlinkedInvoices) && (
                      <Flex
                        role="status"
                        align={{ base: "stretch", sm: "center" }}
                        justify="space-between"
                        direction={{ base: "column", sm: "row" }}
                        gap="2"
                        px="3"
                        py="2"
                        rounded="md"
                        bg="warning.50"
                      >
                        <Text fontSize="13px" color="gray.500">
                          {plural(warnings?.unlinkedInvoices ?? 0, "invoice")}{" "}
                          in this period{" "}
                          {warnings?.unlinkedInvoices === 1 ? "has" : "have"}{" "}
                          this customer's name but{" "}
                          {warnings?.unlinkedInvoices === 1
                            ? "isn't"
                            : "aren't"}{" "}
                          linked to them, so{" "}
                          {warnings?.unlinkedInvoices === 1
                            ? "it isn't"
                            : "they aren't"}{" "}
                          included.
                        </Text>
                        <Button
                          variant="ghost"
                          size="xs"
                          flexShrink={0}
                          color="primary.300"
                          onClick={openUnlinkedInvoices}
                        >
                          View invoices
                        </Button>
                      </Flex>
                    )}
                    {Boolean(warnings?.sameNameCustomers) && (
                      <Box
                        role="status"
                        px="3"
                        py="2"
                        rounded="md"
                        bg="warning.50"
                      >
                        <Text fontSize="13px" color="gray.500">
                          {plural(
                            warnings?.sameNameCustomers ?? 0,
                            "other customer",
                          )}{" "}
                          {warnings?.sameNameCustomers === 1 ? "has" : "have"}{" "}
                          the same name. Their work isn't included.
                        </Text>
                      </Box>
                    )}

                    <Flex gap="3" justify="flex-end">
                      <Button variant="outline" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button
                        loading={isDownloading}
                        disabled={!hasDates}
                        onClick={() =>
                          download(
                            { clientId: customer.id, params },
                            { onSuccess: onClose },
                          )
                        }
                      >
                        Download PDF
                      </Button>
                    </Flex>
                  </>
                )}
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
