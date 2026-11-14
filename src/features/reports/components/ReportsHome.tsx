import {
  Box,
  Button,
  Center,
  Flex,
  Grid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { Lock } from "@/assets/custom";
import { PageHeader } from "@/components/common/PageHeader";
import { RouteConstants } from "@/shared/constants/routes";
import type {
  ReportCatalogEntry,
  ReportCatalogLink,
  ReportSection,
} from "@/shared/interface/report";
import { useGetReportCatalogQuery } from "../api/query";
import { planName } from "./report-format";

const LINK_PAGES: Record<ReportCatalogLink["page"], string> = {
  banking: RouteConstants.banking.base.path,
  activity_log: RouteConstants.settings.activityLog.path,
};

function ReportItem({ report }: { report: ReportCatalogEntry }) {
  if (report.locked) {
    return (
      <Box py="2.5" data-testid="report-locked">
        <Flex align="center" gap="2">
          <Lock boxSize="3" color="gray.300" />
          <Text fontSize="14px" fontWeight="500" color="gray.300">
            {report.name}
          </Text>
        </Flex>
        <Text fontSize="12px" color="gray.300" mt="0.5">
          {report.description}
        </Text>
        <RouterLink to={RouteConstants.settings.billing.path}>
          <Text
            as="span"
            fontSize="12px"
            fontWeight="500"
            color="primary.400"
            _hover={{ textDecoration: "underline" }}
          >
            {report.upgradeTo
              ? `Upgrade to ${planName(report.upgradeTo)}`
              : "See plans"}
          </Text>
        </RouterLink>
      </Box>
    );
  }
  return (
    <ItemLink
      to={RouteConstants.reports.view.generate({ key: report.key })}
      name={report.name}
      description={report.description}
    />
  );
}

function ItemLink({
  to,
  name,
  description,
}: {
  to: string;
  name: string;
  description: string;
}) {
  return (
    <RouterLink to={to}>
      <Box
        py="2.5"
        px="2"
        mx="-2"
        rounded="md"
        _hover={{ bg: "gray.50" }}
        data-testid="report-link"
      >
        <Text fontSize="14px" fontWeight="500" color="primary.400">
          {name}
        </Text>
        <Text fontSize="12px" color="gray.400" mt="0.5">
          {description}
        </Text>
      </Box>
    </RouterLink>
  );
}

function SectionCard({ section }: { section: ReportSection }) {
  return (
    <Box
      bg="white"
      borderWidth="1px"
      borderColor="gray.75"
      rounded="lg"
      px="5"
      py="4"
    >
      <Text textStyle="small-semibold" color="gray.500" mb="1">
        {section.label}
      </Text>
      <Stack gap="0">
        {section.reports.map((report) => (
          <ReportItem key={report.key} report={report} />
        ))}
        {section.links.map((link) => (
          <ItemLink
            key={link.key}
            to={LINK_PAGES[link.page]}
            name={link.name}
            description={link.description}
          />
        ))}
      </Stack>
    </Box>
  );
}

/** The Reports page: every report this person may open, by section. */
export function ReportsHome() {
  const { data, isLoading, isError, refetch } = useGetReportCatalogQuery();
  const sections = data?.sections ?? [];

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
          templateColumns={{
            base: "1fr",
            md: "repeat(2, 1fr)",
            xl: "repeat(3, 1fr)",
          }}
          gap="4"
          alignItems="start"
        >
          {sections.map((section) => (
            <SectionCard key={section.key} section={section} />
          ))}
        </Grid>
      )}
    </Stack>
  );
}
