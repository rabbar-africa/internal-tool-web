import { Flex, Text } from "@chakra-ui/react";

export const MaturityBars: React.FC = () => {
  return (
    <Flex flexDirection="column" gap="12px" alignItems="center">
      <Flex
        height="32px"
        width="209px"
        bg="gray.50"
        borderRadius="10px"
        justifyContent="center"
        alignItems="center"
      >
        <Text textStyle="tiny-regular">Optimized</Text>
      </Flex>
      <Flex
        height="32px"
        width="197px"
        bg="gray.50"
        borderRadius="10px"
        justifyContent="center"
        alignItems="center"
      >
        <Text textStyle="tiny-regular">Defined</Text>
      </Flex>
      <Flex
        height="32px"
        width="159px"
        bg="primary.50"
        border="1px dashed"
        borderColor="primary.300"
        borderRadius="10px"
        justifyContent="center"
        alignItems="center"
      >
        <Text textStyle="tiny-regular" color="primary.300">
          Managed
        </Text>
      </Flex>
      <Flex
        height="32px"
        width="131px"
        bg="success.50"
        borderRadius="10px"
        justifyContent="center"
        alignItems="center"
      >
        <Text textStyle="tiny-regular" color="success.300">
          Initial
        </Text>
      </Flex>
      <Flex
        height="32px"
        width="99px"
        bg="success.50"
        borderRadius="10px"
        justifyContent="center"
        alignItems="center"
      >
        <Text textStyle="tiny-regular" color="success.300">
          Ad-hoc
        </Text>
      </Flex>
    </Flex>
  );
};
