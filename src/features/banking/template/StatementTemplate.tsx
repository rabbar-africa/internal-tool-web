import { useState } from "react";
import { Box, Button, Center, Flex, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomSelect } from "@/components/input/CustomSelect";
import { RouteConstants } from "@/shared/constants/routes";
import {
  formatAccountLabel,
  useAccountOptions,
} from "@/features/settings/components/account-details/AccountSelect";
import {
  useDownloadStatementPdfMutation,
  useGetAccountStatementQuery,
} from "../api";
import {
  StatementRangePicker,
  useStatementRange,
} from "../components/statement/StatementRangePicker";
import { StatementSummary } from "../components/statement/StatementSummary";
import { StatementTable } from "../components/statement/StatementTable";
import { EmailStatementModal } from "../components/statement/EmailStatementModal";

const formatDay = (day: string) => moment(day).format("DD MMM YYYY");

export function StatementTemplate() {
  const { id = "" } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { search } = useLocation();
  const [emailOpen, setEmailOpen] = useState(false);
  const { preset, range, setRange } = useStatementRange();

  const { options, isLoading: accountsLoading } = useAccountOptions({
    includeCash: true,
  });
  const { data, isLoading, isFetching } = useGetAccountStatementQuery(
    id,
    range,
  );
  const statement = data?.data;

  const { mutate: downloadPdf, isPending: isDownloading } =
    useDownloadStatementPdfMutation();

  const subtitle = statement
    ? `${formatAccountLabel(statement.account)} · ${formatDay(
        statement.period.from,
      )} – ${formatDay(statement.period.to)}`
    : "Money in and out of an account, with a running balance";

  return (
    <>
      <Stack gap="6">
        <Box>
          <Button
            variant="ghost"
            size="xs"
            px="1"
            mb="2"
            color="primary.300"
            // Back to all accounts, same period.
            onClick={() =>
              navigate(`${RouteConstants.banking.base.path}${search}`)
            }
          >
            ← Banking
          </Button>
          <PageHeader
            title="Account Statement"
            subtitle={subtitle}
            action={
              <Flex gap="2" flexWrap="wrap">
                <Button
                  variant="outline"
                  disabled={!statement}
                  onClick={() => setEmailOpen(true)}
                >
                  Email
                </Button>
                <Button
                  loading={isDownloading}
                  disabled={!statement}
                  onClick={() => downloadPdf({ accountId: id, range })}
                >
                  Download PDF
                </Button>
              </Flex>
            }
          />
        </Box>

        <Flex
          gap="3"
          align={{ base: "stretch", md: "center" }}
          direction={{ base: "column", md: "row" }}
          wrap="wrap"
        >
          <CustomSelect
            options={options}
            loading={accountsLoading}
            value={id ? [id] : undefined}
            onChange={(opt: { value: string[] }) => {
              const next = opt?.value?.[0];
              // Same period, another account.
              if (next && next !== id) {
                navigate(
                  `${RouteConstants.banking.statement.generate({ id: next })}${search}`,
                );
              }
            }}
            rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
            controlProps={{ w: { base: "100%", md: "240px" } }}
          />
          <StatementRangePicker
            preset={preset}
            range={range}
            onChange={setRange}
          />
        </Flex>

        {statement && (
          <StatementSummary
            currencyCode={statement.currencyCode}
            openingBalance={statement.openingBalance}
            moneyIn={statement.totals.moneyIn}
            moneyOut={statement.totals.moneyOut}
            closingBalance={statement.closingBalance}
          />
        )}

        <Box
          pt={{ base: "1rem", md: "1.5rem" }}
          pb={{ base: "1rem", md: "1.5rem" }}
          bg="white"
          px={{ base: "0.75rem", md: "1rem" }}
          rounded=".625rem"
          shadow="sm"
          borderWidth="1px"
          borderColor="gray.75"
          opacity={isFetching && !isLoading ? 0.6 : 1}
          transition="opacity 0.15s"
        >
          <Box overflowX="auto" minW={0}>
            <StatementTable statement={statement} isLoading={isLoading} />
          </Box>
          {statement && statement.lines.length === 0 && (
            <Center pt="4">
              <Text fontSize="13px" color="gray.300">
                No money in or out in this period.
              </Text>
            </Center>
          )}
        </Box>
      </Stack>

      <EmailStatementModal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        accountId={id}
        range={range}
      />
    </>
  );
}
