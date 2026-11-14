import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Center,
  Flex,
  Group,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import moment from "moment";
import { ArrowLeft, Lock } from "@/assets/custom";
import { RouteConstants } from "@/shared/constants/routes";
import type { ReportBasis, ReportResult } from "@/shared/interface/report";
import {
  getErrorMessage,
  getPlanLock,
  isPermissionDenied,
  PERMISSION_DENIED_MESSAGE,
} from "@/utils/handle-error";
import { useGetReportCatalogQuery, useGetReportQuery } from "../api/query";
import { useReportParams } from "../hooks/useReportParams";
import { ReportDownloadMenu } from "./ReportDownloadMenu";
import { ReportFilters } from "./ReportFilters";
import { ReportAsOfPicker, ReportRangePicker } from "./ReportPeriodPicker";
import { ReportTable } from "./ReportTable";
import { drillHref, planName } from "./report-format";

const day = (value: string) =>
  moment(value, "YYYY-MM-DD").format("DD MMM YYYY");

/** "1 Nov 2026 – 14 Nov 2026 · Accrual (by invoice date) · Mode: Cash". */
function describe(result: ReportResult): string {
  const period =
    result.period.kind === "asOf"
      ? `As of ${day(result.period.asOf)}`
      : `${day(result.period.from)} – ${day(result.period.to)}`;
  return [period, result.basisLabel, ...result.filterLabels]
    .filter(Boolean)
    .join(" · ");
}

function Panel({
  children,
  action,
}: {
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <Center
      flexDirection="column"
      gap="3"
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      py="12"
      px="6"
      textAlign="center"
    >
      {children}
      {action}
    </Center>
  );
}

function UpgradePanel({ message }: { message: string }) {
  const navigate = useNavigate();
  return (
    <Panel
      action={
        <Button
          size="sm"
          onClick={() => navigate(RouteConstants.settings.billing.path)}
        >
          See plans
        </Button>
      }
    >
      <Lock boxSize="5" color="gray.300" />
      <Text fontSize="14px" color="gray.400" maxW="440px">
        {message}
      </Text>
    </Panel>
  );
}

/** Any report, drawn from what the API sends: `/reports/:key`. */
export function ReportViewer() {
  const { key = "" } = useParams<{ key: string }>();
  const navigate = useNavigate();
  const catalog = useGetReportCatalogQuery();
  const entry = catalog.data?.sections
    .flatMap((s) => s.reports)
    .find((r) => r.key === key);

  const params = useReportParams(entry);
  const report = useGetReportQuery(
    key,
    params.apiParams,
    Boolean(entry && !entry.locked),
  );
  const result = report.data;

  const back = (
    <Button
      variant="ghost"
      size="sm"
      alignSelf="flex-start"
      color="gray.400"
      px="0"
      _hover={{ color: "gray.500", bg: "transparent" }}
      onClick={() => navigate(RouteConstants.reports.base.path)}
    >
      <ArrowLeft />
      All reports
    </Button>
  );

  if (catalog.isLoading) {
    return (
      <Center py="20">
        <Spinner color="gray.300" />
      </Center>
    );
  }

  if (!entry) {
    return (
      <Stack gap="4">
        {back}
        <Panel>
          <Text fontSize="14px" color="gray.400" maxW="440px">
            {catalog.isError
              ? "We couldn't load your reports. Try again in a moment."
              : "This report doesn't exist, or your role doesn't include it."}
          </Text>
        </Panel>
      </Stack>
    );
  }

  const basisLabels = catalog.data?.basisLabels ?? {};
  const planLock = report.isError ? getPlanLock(report.error) : null;
  const errorMessage = !report.isError
    ? null
    : isPermissionDenied(report.error)
      ? PERMISSION_DENIED_MESSAGE
      : getErrorMessage(report.error);
  // Only the background refresh: the last answer stays, a little faded.
  const refreshing = report.isFetching && !report.isLoading;

  return (
    <Stack gap="4">
      {back}

      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "flex-start" }}
        gap="3"
        wrap="wrap"
      >
        <Box minW="0" flex="1 1 280px">
          <Text textStyle="h3-bold" color="gray.500">
            {entry.name}
          </Text>
          <Text textStyle="small-regular" color="gray.300" mt="1">
            {entry.description}
          </Text>
        </Box>
        {!entry.locked && (
          <ReportDownloadMenu
            reportKey={key}
            params={params.apiParams}
            formats={catalog.data?.fileFormats}
            disabled={!result || report.isError}
          />
        )}
      </Flex>

      {entry.locked ? (
        <UpgradePanel
          message={
            entry.upgradeTo
              ? `${entry.name} is on the ${planName(entry.upgradeTo)} plan and above.`
              : `${entry.name} isn't on your plan.`
          }
        />
      ) : (
        <>
          {/* Period, basis and filters: one row that wraps. */}
          <Flex gap="3" wrap="wrap" align="center">
            {entry.period === "asOf" ? (
              <ReportAsOfPicker asOf={params.asOf} onChange={params.setAsOf} />
            ) : (
              <ReportRangePicker
                preset={params.preset}
                range={params.range}
                onChange={params.setRange}
              />
            )}
            {entry.basis.length > 1 && (
              <Group attached>
                {entry.basis.map((b: ReportBasis) => (
                  <Button
                    key={b}
                    size="sm"
                    variant={params.basis === b ? "solid" : "outline"}
                    onClick={() => params.setBasis(b)}
                    aria-pressed={params.basis === b}
                  >
                    {basisLabels[b] ?? b}
                  </Button>
                ))}
              </Group>
            )}
          </Flex>

          <ReportFilters
            filters={entry.filters}
            values={params.filters}
            onChange={params.setFilter}
            onClear={params.clearFilters}
          />

          {report.isLoading && (
            <Center py="16">
              <Spinner color="gray.300" />
            </Center>
          )}

          {planLock && <UpgradePanel message={planLock.message} />}

          {errorMessage && !planLock && (
            <Panel
              action={
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => report.refetch()}
                >
                  Try again
                </Button>
              }
            >
              <Text fontSize="14px" color="gray.400" maxW="440px">
                {errorMessage}
              </Text>
            </Panel>
          )}

          {result && !report.isError && (
            <Stack
              gap="3"
              opacity={refreshing ? 0.6 : 1}
              transition="opacity 0.15s"
              aria-busy={refreshing}
            >
              <Flex
                justify="space-between"
                gap="2"
                wrap="wrap"
                fontSize="12px"
                color="gray.400"
              >
                <Text>{describe(result)}</Text>
                <Text>Amounts in {result.currency}</Text>
              </Flex>

              {result.rows.length ? (
                <ReportTable
                  columns={result.columns}
                  rows={result.rows}
                  totals={result.totals}
                  currency={result.currency}
                  hrefOf={(row) => drillHref(row.drill, params.periodSearch)}
                  onOpen={(href) => navigate(href)}
                />
              ) : (
                <Panel>
                  <Text fontSize="14px" color="gray.400">
                    Nothing to show for this period
                    {Object.keys(params.filters).length ? " and filters" : ""}.
                  </Text>
                </Panel>
              )}

              {result.truncated && (
                <Text
                  fontSize="13px"
                  color="orange.600"
                  bg="orange.50"
                  rounded="md"
                  px="3"
                  py="2"
                >
                  Only the first 25,000 rows are shown. Narrow the period or
                  filters.
                </Text>
              )}

              {result.notes.length > 0 && (
                <Stack gap="1" as="ul" pl="4" listStyleType="disc">
                  {result.notes.map((note) => (
                    <Text as="li" key={note} fontSize="12px" color="gray.400">
                      {note}
                    </Text>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
        </>
      )}
    </Stack>
  );
}
