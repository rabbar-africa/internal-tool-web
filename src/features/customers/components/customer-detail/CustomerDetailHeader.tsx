import { Avatar, Box, Flex, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import type { ICustomer } from "@/shared/interface/customer";
import { CustomerFollowUp } from "./CustomerFollowUp";
import { CustomerActionsMenu } from "./CustomerActionsMenu";

const STAGE_COLORS: Record<string, { bg: string; color: string }> = {
  CUSTOMER: { bg: "green.50", color: "green.600" },
  RETURNING_CUSTOMER: { bg: "teal.50", color: "teal.600" },
  LEAD: { bg: "blue.50", color: "blue.600" },
  PROSPECT: { bg: "purple.50", color: "purple.600" },
  INACTIVE: { bg: "gray.100", color: "gray.400" },
};

interface CustomerDetailHeaderProps {
  customer: ICustomer;
}

export function CustomerDetailHeader({ customer }: CustomerDetailHeaderProps) {
  const stageStyle = STAGE_COLORS[customer.stage ?? ""] ?? {
    bg: "gray.100",
    color: "gray.400",
  };

  const initials = [customer.firstName?.[0], customer.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  return (
    <Box
      bg="white"
      rounded="2xl"
      overflow="hidden"
      shadow="xs"
      borderWidth="1px"
      borderColor="gray.75"
    >
      {/* Gradient stripe */}
      <Box
        h="6"
        bgGradient="to-r"
        gradientFrom="primary.100"
        gradientTo="primary.50"
      />

      <Box px={{ base: "4", md: "8" }} pb="6">
        {/* Top row: avatar overlaps the stripe, actions stay top-right */}
        <Flex justify="space-between" align="flex-start">
          <Avatar.Root
            size={{ base: "xl", md: "2xl" }}
            mt="-6"
            bg="primary.200"
            color="white"
            borderWidth="3px"
            borderColor="white"
            shadow="md"
            flexShrink={0}
          >
            <Avatar.Fallback fontWeight="700" fontSize="xl">
              {initials}
            </Avatar.Fallback>
          </Avatar.Root>

          <Box pt="3" flexShrink={0}>
            <CustomerActionsMenu customer={customer} />
          </Box>
        </Flex>

        {/* Identity + meta */}
        <Flex
          mt="3"
          justify="space-between"
          align={{ base: "flex-start", md: "flex-end" }}
          direction={{ base: "column", md: "row" }}
          gap="4"
        >
          <Box minW="0">
            <Text
              fontSize={{ base: "1.05rem", md: "1.2rem" }}
              fontWeight="700"
              color="gray.600"
              lineHeight="1.2"
              wordBreak="break-word"
            >
              {customer.displayName}
            </Text>
            <Flex gap="2" mt="1.5" align="center" flexWrap="wrap">
              {customer.stage && (
                <Box
                  bg={stageStyle.bg}
                  px="8px"
                  py="2px"
                  rounded="full"
                  display="inline-flex"
                >
                  <Text
                    fontSize="11px"
                    fontWeight="600"
                    color={stageStyle.color}
                    textTransform="capitalize"
                  >
                    {customer.stage.replace(/_/g, " ").toLowerCase()}
                  </Text>
                </Box>
              )}
              {customer.source && (
                <Text fontSize="11px" color="gray.300">
                  via {customer.source}
                </Text>
              )}
            </Flex>
          </Box>

          <Stack
            gap="2"
            align={{ base: "flex-start", md: "flex-end" }}
            flexShrink={0}
          >
            <CustomerFollowUp customer={customer} />
            <Text fontSize="11px" color="gray.300">
              Since {moment(customer.createdAt).format("MMM YYYY")}
            </Text>
          </Stack>
        </Flex>
      </Box>
    </Box>
  );
}
