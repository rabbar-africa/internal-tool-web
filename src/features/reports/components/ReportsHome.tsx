import { useMemo, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
  chakra,
} from "@chakra-ui/react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { CaretRight, Lock } from "@/assets/custom";
import { PageHeader } from "@/components/common/PageHeader";
import { CustomSelect } from "@/components/input/CustomSelect";
import { SearchInput } from "@/components/input/SearchInput";
import { usePermissions } from "@/hooks/usePermissions";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ReportCatalogEntry,
  ReportCatalogLink,
  ReportSection,
} from "@/shared/interface/report";
import { useGetReportCatalogQuery } from "../api/query";
import { planName } from "./report-format";
import { HOME_KEYS, withReportsQuery } from "../utils/reports-query";

const LINK_PAGES: Record<ReportCatalogLink["page"], string> = {
  banking: RouteConstants.banking.base.path,
  activity_log: RouteConstants.settings.activityLog.path,
};

/** "All reports" in the section list. */
const ALL = "__all__";

const countOf = (section: ReportSection) =>
  section.reports.length + section.links.length;

const matches = (query: string, ...texts: string[]) =>
  !query || texts.some((t) => t.toLowerCase().includes(query));

/** One report (or a link to a page) as a full-width row. */
function Row({
  to,
  name,
  description,
  aside,
  locked = false,
}: {
  to: string | null;
  name: string;
  description: string;
  aside?: React.ReactNode;
  locked?: boolean;
}) {
  const body = (
    <Flex
      align="center"
      gap="4"
      px={{ base: "4", md: "5" }}
      py="3.5"
      borderTopWidth="1px"
      borderColor="gray.75"
      _hover={to ? { bg: "gray.50" } : undefined}
      cursor={to ? "pointer" : "default"}
      data-testid={locked ? "report-locked" : "report-link"}
    >
      <Box flex="1" minW="0">
        <Flex align="center" gap="2">
          {locked && <Lock boxSize="3" color="gray.300" />}
          <Text
            fontSize="14px"
            fontWeight="500"
            color={locked ? "gray.300" : "black"}
          >
            {name}
          </Text>
        </Flex>
        <Text fontSize="13px" color="gray.400" mt="0.5">
          {description}
        </Text>
      </Box>
      {aside}
      {to && <CaretRight boxSize="2.5" color="gray.300" flexShrink={0} />}
    </Flex>
  );
  return to ? <RouterLink to={to}>{body}</RouterLink> : body;
}

function ReportRow({
  report,
  shared,
}: {
  report: ReportCatalogEntry;
  /** The shared query, carried into the report and back. */
  shared: URLSearchParams;
}) {
  const mayUpgrade = usePermissions().canAccess("billing");
  if (!report.locked) {
    return (
      <Row
        to={withReportsQuery(
          RouteConstants.reports.view.generate({ key: report.key }),
          shared,
        )}
        name={report.name}
        description={report.description}
      />
    );
  }
  const plan = report.upgradeTo ? planName(report.upgradeTo) : null;
  return (
    <Row
      // Those who manage billing go there; others are told who can.
      to={mayUpgrade ? RouteConstants.settings.billing.path : null}
      name={report.name}
      description={report.description}
      locked
      aside={
        <Stack gap="0.5" align="flex-end" flexShrink={0}>
          <Badge size="sm" variant="subtle" colorPalette="orange">
            {plan ? `${plan} plan` : "Not on your plan"}
          </Badge>
          {!mayUpgrade && (
            <Text fontSize="11px" color="gray.400">
              Ask an admin to upgrade
            </Text>
          )}
        </Stack>
      }
    />
  );
}

function SectionBlock({
  section,
  query,
  shared,
}: {
  section: ReportSection;
  query: string;
  shared: URLSearchParams;
}) {
  const reports = section.reports.filter((r) =>
    matches(query, r.name, r.description),
  );
  const links = section.links.filter((l) =>
    matches(query, l.name, l.description),
  );
  if (!reports.length && !links.length) return null;
  return (
    <Box>
      <Text
        px={{ base: "4", md: "5" }}
        pt="4"
        pb="2"
        fontSize="12px"
        fontWeight="600"
        color="gray.400"
        textTransform="uppercase"
        letterSpacing="0.04em"
      >
        {section.label}
      </Text>
      {reports.map((report) => (
        <ReportRow key={report.key} report={report} shared={shared} />
      ))}
      {links.map((link) => (
        <Row
          key={link.key}
          to={LINK_PAGES[link.page]}
          name={link.name}
          description={link.description}
        />
      ))}
    </Box>
  );
}

/** The section list on the left (a select on small screens). */
function SectionNav({
  sections,
  active,
  onChange,
}: {
  sections: ReportSection[];
  active: string;
  onChange: (key: string) => void;
}) {
  const total = sections.reduce((n, s) => n + countOf(s), 0);
  const items = [
    { key: ALL, label: "All reports", count: total },
    ...sections.map((s) => ({ key: s.key, label: s.label, count: countOf(s) })),
  ];
  return (
    <>
      <Box display={{ base: "block", md: "none" }}>
        <CustomSelect
          options={items.map((i) => ({
            value: i.key,
            label: `${i.label} (${i.count})`,
          }))}
          value={[active]}
          onChange={(opt: { value: string[] }) =>
            onChange(opt?.value?.[0] ?? ALL)
          }
        />
      </Box>
      <Stack
        display={{ base: "none", md: "flex" }}
        gap="0.5"
        position="sticky"
        top="4"
      >
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <chakra.button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              gap="2"
              px="3"
              py="2"
              rounded="md"
              textAlign="left"
              fontSize="14px"
              fontWeight={isActive ? "600" : "400"}
              color="black"
              bg={isActive ? "white" : "transparent"}
              borderWidth="1px"
              borderColor={isActive ? "gray.75" : "transparent"}
              _hover={{ bg: "white" }}
              aria-current={isActive ? "true" : undefined}
            >
              <Text as="span">{item.label}</Text>
              <Text as="span" fontSize="12px" color="gray.400">
                {item.count}
              </Text>
            </chakra.button>
          );
        })}
      </Stack>
    </>
  );
}

/** The Reports page: every report this person may open, by section. */
export function ReportsHome() {
  const { data, isLoading, isError, refetch } = useGetReportCatalogQuery();
  const sections = useMemo(() => data?.sections ?? [], [data?.sections]);
  // The sidebar section and the search live in the URL (reports-query.ts),
  // so a reload, a shared link or coming back from a report keeps them.
  const [shared, setShared] = useSearchParams();
  const sectionParam = shared.get(HOME_KEYS.section);
  const active =
    sectionParam && sections.some((s) => s.key === sectionParam)
      ? sectionParam
      : ALL;
  const [search, setSearch] = useState(
    () => shared.get(HOME_KEYS.search) ?? "",
  );
  const query = search.trim().toLowerCase();

  const updateHome = (changes: { section?: string; search?: string }) =>
    setShared(
      (prev) => {
        const next = new URLSearchParams(prev);
        const set = (key: string, value: string | undefined) => {
          if (value === undefined) return;
          if (value) next.set(key, value);
          else next.delete(key);
        };
        set(HOME_KEYS.section, changes.section === ALL ? "" : changes.section);
        set(HOME_KEYS.search, changes.search?.trim());
        return next;
      },
      { replace: true },
    );
  const changeSearch = (text: string) => {
    setSearch(text);
    updateHome({ search: text });
  };

  // A search looks through every section.
  const shown =
    query || active === ALL
      ? sections
      : sections.filter((s) => s.key === active);
  const anyMatch = shown.some(
    (s) =>
      s.reports.some((r) => matches(query, r.name, r.description)) ||
      s.links.some((l) => matches(query, l.name, l.description)),
  );

  return (
    <Stack gap="5">
      <PageHeader
        title="Reports"
        subtitle="Your books for any period: profit, sales, what customers owe, expenses, jobs and tax"
      />

      {isLoading && (
        <Center py="16">
          <Spinner color="gray.300" />
        </Center>
      )}

      {isError && (
        <Flex
          align="center"
          justify="space-between"
          gap="3"
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="lg"
          p="4"
        >
          <Text fontSize="14px" color="gray.400">
            We couldn't load your reports.
          </Text>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </Flex>
      )}

      {data && !sections.length && (
        <Center
          bg="white"
          borderWidth="1px"
          borderColor="gray.75"
          rounded="lg"
          py="12"
          px="6"
          textAlign="center"
        >
          <Text fontSize="14px" color="gray.400" maxW="420px">
            Your role doesn't include any reports. Ask an admin on your team if
            you need them.
          </Text>
        </Center>
      )}

      {sections.length > 0 && (
        <Grid
          templateColumns={{ base: "1fr", md: "220px 1fr" }}
          gap={{ base: "3", md: "6" }}
          alignItems="start"
        >
          <SectionNav
            sections={sections}
            active={active}
            onChange={(key) => {
              setSearch("");
              updateHome({ section: key, search: "" });
            }}
          />

          <Stack gap="3" minW="0">
            <SearchInput
              placeholder="Search reports"
              value={search}
              onChange={changeSearch}
              onSearch={changeSearch}
              width="100%"
            />
            <Box
              bg="white"
              borderWidth="1px"
              borderColor="gray.75"
              rounded="lg"
              overflow="hidden"
              pb="1"
            >
              {anyMatch ? (
                shown.map((section) => (
                  <SectionBlock
                    key={section.key}
                    section={section}
                    query={query}
                    shared={shared}
                  />
                ))
              ) : (
                <Text px="5" py="8" fontSize="14px" color="gray.400">
                  No report matches “{search.trim()}”.
                </Text>
              )}
            </Box>
          </Stack>
        </Grid>
      )}
    </Stack>
  );
}
