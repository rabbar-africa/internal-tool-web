import { Button, Flex, Separator, Text } from "@chakra-ui/react";
import { ProgressBar } from "../maturity-report/ProgressBar";
import { progressBars } from "@/shared/data";

export function ComplianceScore() {
  return (
    <Flex
      bg="white"
      p="30px"
      width="100%"
      borderRadius="10px"
      flexDirection="column"
    >
      <Flex align="center" justify="space-between" width="100%">
        <Text textStyle="default-semibold">Compliance Score Breakdown</Text>
        <Button
          variant="outline"
          _hover={{
            bg: "gray.50",
          }}
          borderColor="gray.50"
          color="gray.300"
          height="36px"
          fontSize="12px"
          fontWeight={400}
          width="112px"
        >
          Export report
        </Button>
      </Flex>
      <Separator borderColor="gray.50" my="18px" />
      <Flex align="center" width="100%" gap="19px">
        <Flex flex="1" flexDirection="column" gap="10px">
          {progressBars.map((item, index) => (
            <ProgressBar
              key={index}
              text={item.text}
              value={item.value}
              color={item.color}
            />
          ))}
        </Flex>
      </Flex>
    </Flex>
  );
}
