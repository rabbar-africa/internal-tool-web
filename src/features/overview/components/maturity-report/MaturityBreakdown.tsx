import { Flex, Separator, Text } from "@chakra-ui/react";
import { ProgressBar } from "./ProgressBar";
import { progressBars } from "@/shared/data/maturity-report";

export const MaturityBreakdown = () => {
  return (
    <Flex
      bg="white"
      p="30px"
      width="100%"
      borderRadius="10px"
      flexDirection="column"
    >
      <Flex align="center" justify="space-between" width="100%">
        <Text textStyle="default-semibold">Maturity Breakdown by Area</Text>
      </Flex>
      <Separator borderColor="gray.50" my="18px" />
      <Flex flexDirection="column" gap="12px" width="100%">
        {progressBars.map((item, index) => (
          <ProgressBar
            key={index}
            text={item.text}
            value={item.value}
            color={item.color}
            description={item.description}
          />
        ))}
      </Flex>
    </Flex>
  );
};
