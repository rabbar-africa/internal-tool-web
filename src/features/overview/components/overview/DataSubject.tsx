import { Button, Flex, Text } from "@chakra-ui/react";

export const DataSubject = () => {
  return (
    <Flex
      bg="white"
      p="30px"
      width="100%"
      borderRadius="10px"
      flexDirection="column"
    >
      <Flex alignItems="center" justifyContent="space-between" width="100%">
        <Text textStyle="default-semibold">Data Subject Rights Requests</Text>
        <Flex alignItems="center">
          <Button
            variant="outline"
            _hover={{
              bg: "gray.50",
            }}
            borderColor="gray.50"
            color="gray.300"
            height="36px"
            textStyle="tiny-regular"
            width="112px"
            mr="20px"
          >
            Filter
          </Button>
          <Button
            width="112px"
            height="36px"
            textStyle="tiny-regular"
            color="white"
          >
            New Request
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
};
