import { useMemo, useState } from "react";
import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CustomSelect } from "@/components/input/CustomSelect";
import { DateField } from "@/components/input/DateField";
import { SearchInput } from "@/components/input/SearchInput";
import { useGetTeamMembersQuery } from "@/features/settings/api/team.query";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ActivityEntityType,
  ActivitySource,
  IActivityFilter,
} from "@/shared/interface/activity";
import type { ITeamMember } from "@/shared/interface/team";
import { useActivityQuery } from "../api/query";
import { ActivityFeed } from "./ActivityFeed";
import { ENTITY_LABELS, SOURCE_OPTIONS } from "./activity-labels";

const ENTITY_OPTIONS = Object.entries(ENTITY_LABELS).map(([value, label]) => ({
  value,
  label,
}));

const DELETIONS =
  "invoice.deleted,payment.deleted,expense.deleted,credit_note.deleted,credit_note.voided,invoice.voided,transfer.deleted,bank_account.deleted,tax.deleted,credit_note.refund_deleted";

/** Settings → Activity Log: who did what, across the business. */
export function ActivityLog() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [actorUserId, setActorUserId] = useState("");
  const [entityType, setEntityType] = useState("");
  const [source, setSource] = useState("");
  const [onlyRemovals, setOnlyRemovals] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const { data: membersData } = useGetTeamMembersQuery({ limit: 100 });
  const members: ITeamMember[] = membersData?.data ?? membersData ?? [];
  const memberOptions = members.map((m) => ({
    value: m.id,
    label: `${m.firstName} ${m.lastName}`.trim(),
  }));

  const filter = useMemo<IActivityFilter>(
    () => ({
      ...(from ? { from } : {}),
      ...(to ? { to } : {}),
      ...(actorUserId ? { actorUserId } : {}),
      ...(entityType ? { entityType: entityType as ActivityEntityType } : {}),
      ...(source ? { source: source as ActivitySource } : {}),
      ...(onlyRemovals ? { action: DELETIONS } : {}),
      ...(search ? { search } : {}),
      limit: 50,
    }),
    [from, to, actorUserId, entityType, source, onlyRemovals, search],
  );
  const query = useActivityQuery(filter);
  const pages = query.data?.pages ?? [];
  const entries = pages.flatMap((p) => p.items);
  const history = pages[0]?.history;

  const select = (
    placeholder: string,
    options: Array<{ value: string; label: string }>,
    value: string,
    onChange: (v: string) => void,
    basis = "160px",
  ) => (
    // Grows to share the row, and wraps to the next line below its basis.
    <Box flex={`1 1 ${basis}`} minW="0">
      <CustomSelect
        placeholder={placeholder}
        options={[{ value: "", label: placeholder }, ...options]}
        value={value ? [value] : undefined}
        onChange={(opt: { value: string[] }) => onChange(opt?.value?.[0] ?? "")}
        rootProps={{ size: "sm", w: "100%" }}
        controlProps={{ w: "100%" }}
      />
    </Box>
  );

  return (
    <Box>
      {history?.limitedToDays ? (
        <Flex
          bg="yellow.50"
          borderWidth="1px"
          borderColor="yellow.200"
          rounded="md"
          px="4"
          py="3"
          mb="4"
          gap="3"
          align={{ base: "flex-start", md: "center" }}
          justify="space-between"
          direction={{ base: "column", md: "row" }}
        >
          <Text fontSize="13px" color="gray.500">
            {history.message ??
              `Your plan shows the last ${history.limitedToDays} days.`}{" "}
            Everything is still being recorded.
          </Text>
          {history.upgradeTo && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => navigate(RouteConstants.settings.billing.path)}
            >
              See plans
            </Button>
          )}
        </Flex>
      ) : null}

      {/* One row that wraps: each filter takes its share of the width. */}
      <Flex gap="3" mb="4" wrap="wrap" align="center">
        {select("Everyone", memberOptions, actorUserId, setActorUserId)}
        {select("All records", ENTITY_OPTIONS, entityType, setEntityType)}
        {select("Anywhere", SOURCE_OPTIONS, source, setSource, "140px")}
        <Flex gap="2" align="center" flex="2 1 300px" minW="0">
          <DateField
            label="From"
            value={from}
            max={to || undefined}
            onChange={setFrom}
            containerProps={{ flex: "1", minW: "0" }}
          />
          <DateField
            label="To"
            value={to}
            min={from || undefined}
            onChange={setTo}
            containerProps={{ flex: "1", minW: "0" }}
          />
        </Flex>
        <Box flex="2 1 220px" minW="0">
          <SearchInput
            placeholder="Search by number, e.g. INV-0012"
            value={searchInput}
            onChange={setSearchInput}
            onSearch={setSearch}
            debounceMs={400}
            loading={query.isFetching && !query.isFetchingNextPage}
            width="100%"
          />
        </Box>
        <Button
          size="sm"
          flexShrink={0}
          variant={onlyRemovals ? "solid" : "outline"}
          colorPalette={onlyRemovals ? "red" : "gray"}
          onClick={() => setOnlyRemovals((v) => !v)}
        >
          Deletions & voids only
        </Button>
      </Flex>

      <Box
        bg="white"
        borderWidth="1px"
        borderColor="gray.75"
        rounded="lg"
        px={{ base: "4", md: "5" }}
        py="1"
      >
        <ActivityFeed
          entries={entries}
          isLoading={query.isLoading}
          isError={query.isError}
          onRetry={() => query.refetch()}
          hasMore={Boolean(query.hasNextPage)}
          isLoadingMore={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
          emptyText="Nothing matches. Changes to invoices, payments, credit notes, expenses, transfers, bank accounts and taxes are recorded from now on."
        />
      </Box>
    </Box>
  );
}
