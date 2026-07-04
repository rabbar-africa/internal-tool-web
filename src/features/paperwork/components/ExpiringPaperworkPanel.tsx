import { Box, Center, Flex, Skeleton, Stack, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { DashboardCard } from "@/features/overview/components/dashboard/DashboardCard";
import { RouteConstants } from "@/shared/constants/routes";
import { useGetExpiringPaperworkQuery } from "../api/query";
import {
  formatDate,
  formatDaysUntil,
  formatDocumentType,
  STATUS_META,
} from "../utils/paperwork";

interface ExpiringPaperworkPanelProps {
  /** How many documents to show. Defaults to 6. */
  limit?: number;
}

export function ExpiringPaperworkPanel({
  limit = 6,
}: ExpiringPaperworkPanelProps) {
  const navigate = useNavigate();
  const { data, isLoading } = useGetExpiringPaperworkQuery({
    limit,
    includeExpired: true,
  });

  const documents = data?.data ?? [];

  return (
    <DashboardCard
      title="Expiring Paperwork"
      subtitle="Documents needing attention soon"
      action={
        <Text
          as="button"
          fontSize="12px"
          fontWeight="500"
          color="primary.500"
          onClick={() => navigate(RouteConstants.paperwork.base.path)}
          _hover={{ textDecoration: "underline" }}
        >
          View all
        </Text>
      }
    >
      {isLoading ? (
        <Stack gap="3" mt="1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} height="44px" rounded="md" />
          ))}
        </Stack>
      ) : documents.length > 0 ? (
        <Stack gap="0" mt="1">
          {documents.map((doc, i) => {
            const meta = STATUS_META[doc.status] ?? STATUS_META.NO_EXPIRY;
            const overdue = (doc.daysUntilExpiry ?? 0) < 0;
            return (
              <Flex
                key={doc.id}
                role="button"
                align="center"
                justify="space-between"
                gap="3"
                py="3"
                borderTopWidth={i === 0 ? "0" : "1px"}
                borderColor="gray.75"
                cursor="pointer"
                _hover={{ bg: "gray.50/60" }}
                onClick={() => navigate(RouteConstants.paperwork.base.path)}
              >
                <Box minW="0">
                  <Text
                    fontSize="13px"
                    fontWeight="600"
                    color="gray.500"
                    truncate
                  >
                    {formatDocumentType(doc.documentType)}
                  </Text>
                  <Text fontSize="12px" color="gray.300" truncate>
                    {doc.client?.displayName || "—"}
                    {doc.vehicle?.registrationNumber
                      ? ` · ${doc.vehicle.registrationNumber}`
                      : ""}
                  </Text>
                </Box>
                <Box textAlign="right" flexShrink={0}>
                  <Text
                    fontSize="12px"
                    fontWeight="600"
                    color={overdue ? "red.500" : meta.color}
                  >
                    {formatDaysUntil(doc.daysUntilExpiry) || meta.label}
                  </Text>
                  <Text fontSize="11px" color="gray.300">
                    {formatDate(doc.expiryDate)}
                  </Text>
                </Box>
              </Flex>
            );
          })}
        </Stack>
      ) : (
        <Center h="180px">
          <Text fontSize="13px" color="gray.300">
            No documents expiring soon
          </Text>
        </Center>
      )}
    </DashboardCard>
  );
}
