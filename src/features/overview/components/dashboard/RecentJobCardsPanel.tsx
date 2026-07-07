import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";
import { DashboardCard } from "./DashboardCard";
import { jobCardStatusColor, prettyStatus } from "./chart-theme";
import type { RecentJobCard } from "../../interface";

interface RecentJobCardsPanelProps {
  data: RecentJobCard[];
}

function formatDate(value?: string): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function StatusPill({ status }: { status?: string }) {
  if (!status) return null;
  const color = jobCardStatusColor(status);
  return (
    <Flex
      align="center"
      gap="1.5"
      px="2"
      py="0.5"
      rounded="full"
      bg={`${color}14`}
      flexShrink={0}
    >
      <Box w="6px" h="6px" rounded="full" bg={color} />
      <Text fontSize="11px" fontWeight="500" color="gray.400">
        {prettyStatus(status)}
      </Text>
    </Flex>
  );
}

export function RecentJobCardsPanel({ data }: RecentJobCardsPanelProps) {
  const jobCards = data.slice(0, 5);

  return (
    <DashboardCard title="Recent Job Cards" subtitle="Latest activity">
      {jobCards.length > 0 ? (
        <Stack gap="0" mt="1">
          {jobCards.map((jc, i) => {
            const meta = [
              jc.jobNumber,
              jc.vehicleRegistrationNumber,
              formatDate(jc.openedAt),
            ].filter(Boolean);
            return (
              <Flex
                key={jc.id}
                align="center"
                justify="space-between"
                gap="3"
                py="3"
                borderTopWidth={i === 0 ? "0" : "1px"}
                borderColor="gray.75"
              >
                <Box minW="0">
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.500"
                    truncate
                  >
                    {jc.customerName || "—"}
                  </Text>
                  <Text fontSize="12px" color="gray.300" truncate>
                    {meta.join(" · ")}
                  </Text>
                </Box>
                <StatusPill status={jc.status} />
              </Flex>
            );
          })}
        </Stack>
      ) : (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No recent job cards
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
