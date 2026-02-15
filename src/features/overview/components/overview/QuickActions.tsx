import { ShieldIcon, UserCirclePlus } from "@/assets/custom";
import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";

interface QuickAction {
  id: string;
  message: string;
  description: string;
  type: "success" | "error";
}

const data: QuickAction[] = [
  {
    id: "1",
    message: "Review pending user registrations.",
    description:
      "Please verify and approve new users requesting access to the system.",
    type: "success",
  },
  {
    id: "2",
    message: "Critical security alert detected.",
    description: "Unusual login activity detected from multiple IP addresses.",
    type: "error",
  },
  {
    id: "3",
    message: "Approve merchant verification requests.",
    description: "5 merchants are waiting for account verification approval.",
    type: "success",
  },
  {
    id: "4",
    message: "Failed transactions require attention.",
    description: "Multiple payment failures detected in the last hour.",
    type: "error",
  },
  {
    id: "5",
    message: "Update system configurations.",
    description: "Review and update payment gateway settings.",
    type: "success",
  },
];

export function QuickActions() {
  return (
    <Box
      bg={"white"}
      p={"1.5rem"}
      rounded={".625rem"}
      w={"full"}
      minW="0"
      h={"100%"}
    >
      <Box mb={"1.5rem"}>
        <Text textStyle={"large-bold"}> Quick Actions </Text>
        <Text textStyle={"tiny-regular"} color={"gray.300"}>
          Handle Pending Tasks and Actions
        </Text>
      </Box>

      <Stack
        gap={"1rem"}
        maxH={"10rem"}
        overflowY={"scroll"}
        css={{
          WebkitScrollbar: {
            height: "8px",
            width: "8px",
          },
          "::WebkitScrollbarTrack": {
            background: "transparent",
          },
          "::WebkitScrollbarThumb": {
            background: "#d1d5db",
            borderRadius: "4px",
          },
          "::WebkitScrollbarThumb:hover": {
            background: "#9ca3af",
          },
          /* Firefox */
          scrollbarWidth: "thin",
          scrollbarColor: "#d1d5db transparent",
        }}
      >
        {data.map((action) => {
          const isError = action.type === "error";
          const bgColor = isError ? "error.50" : "success.50";
          const iconColor = isError ? "error.300" : "success.300";
          const Icon = isError ? ShieldIcon : UserCirclePlus;

          return (
            <Flex
              key={action.id}
              alignItems={"center"}
              gap={"1rem"}
              border={"1px solid"}
              borderColor={"gray.50"}
              rounded={".25rem"}
              px={"1.25rem"}
              py={".75rem"}
            >
              <Center bg={bgColor} boxSize={"2.5rem"} rounded={"100%"}>
                <Icon w={"1rem"} color={iconColor} />
              </Center>
              <Box>
                <Text textStyle={"tiny-regular"} color={"gray.500"}>
                  {action.message}
                </Text>
                <Text textStyle={"tiny-regular"}>{action.description}</Text>
              </Box>
            </Flex>
          );
        })}
      </Stack>
    </Box>
  );
}
