import { ShieldIcon } from "@/assets/custom";
import { Box, Center, Flex, Stack, Text } from "@chakra-ui/react";

const data = [
  {
    id: "1",
    message: "High CPU usage detected on server 3.",
    ago: "2 hours ago",
    icon: <ShieldIcon w={"1rem"} color={"error.300"} />,
  },
  {
    id: "2",
    message: "New login from unrecognized device.",
    ago: "5 hours ago",
    icon: <ShieldIcon w={"1rem"} color={"error.300"} />,
  },
  {
    id: "3",
    message: "Scheduled maintenance completed successfully.",
    ago: "1 day ago",
    icon: <ShieldIcon w={"1rem"} color={"error.300"} />,
  },
];
export function RecentAlert() {
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
        <Text textStyle={"large-bold"}>Recent Alert</Text>
        <Text textStyle={"tiny-regular"} color={"gray.300"}>
          System Alerts and Notifications
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
        {data.map((alert) => (
          <Flex
            key={alert.id}
            alignItems={"center"}
            gap={"1rem"}
            border={"1px solid"}
            borderColor={"gray.50"}
            rounded={".25rem"}
            px={"1.25rem"}
            py={".75rem"}
          >
            {alert.icon && (
              <Center bg={"error.50"} boxSize={"2.5rem"} rounded={"100%"}>
                {alert.icon}
              </Center>
            )}
            <Box>
              <Text textStyle={"tiny-regular"} color={"gray.500"}>
                {alert.message}
              </Text>
              <Text textStyle={"tiny-regular"}>{alert.ago}</Text>
            </Box>
          </Flex>
        ))}
      </Stack>
    </Box>
  );
}
