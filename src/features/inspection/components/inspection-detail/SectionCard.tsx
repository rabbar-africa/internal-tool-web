import { Box, Flex, Text } from "@chakra-ui/react";

export function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
      overflow="hidden"
    >
      <Flex
        px={{ base: "5", md: "6" }}
        py="4"
        align="center"
        gap="3"
        borderBottomWidth="1px"
        borderColor="gray.75"
        bg="gray.50/40"
      >
        <Flex
          w="7"
          h="7"
          bg="primary.50"
          rounded="lg"
          align="center"
          justify="center"
          flexShrink={0}
        >
          {icon}
        </Flex>
        <Text fontSize="13px" fontWeight="600" color="gray.500">
          {title}
        </Text>
      </Flex>
      <Box px={{ base: "5", md: "6" }} py="5">
        {children}
      </Box>
    </Box>
  );
}
