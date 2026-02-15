import { Button, Flex, Text } from "@chakra-ui/react";

export const PendingTasks = () => {
  return (
    <Flex bg="white" width="100%" borderRadius="10px" flexDirection="column">
      <Flex align="center" justify="space-between">
        <Text textStyle="default-semibold">Pending Tasks</Text>
        <Button
          variant="outline"
          _hover={{
            bg: "transparent",
          }}
          border="none"
          color="primary"
          height="36px"
          fontSize="12px"
          fontWeight={400}
        >
          View All
        </Button>
      </Flex>
    </Flex>
  );
};
