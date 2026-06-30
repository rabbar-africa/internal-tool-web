import { Box, Flex, Text } from "@chakra-ui/react";

interface Step {
  id: number;
  label: string;
}

interface SignupStepperProps {
  steps: Step[];
  current: number;
}

export function SignupStepper({ steps, current }: SignupStepperProps) {
  return (
    <Flex align="center">
      {steps.map((s, i) => {
        const active = current === s.id;
        const done = current > s.id;
        return (
          <Flex
            key={s.id}
            align="center"
            flex={i < steps.length - 1 ? 1 : "0 0 auto"}
          >
            <Flex align="center" gap="2" flexShrink={0}>
              <Flex
                w="28px"
                h="28px"
                rounded="full"
                align="center"
                justify="center"
                bg={done ? "primary.400" : active ? "primary.50" : "gray.50"}
                borderWidth="1px"
                borderColor={done || active ? "primary.400" : "gray.100"}
                color={done ? "white" : active ? "primary.400" : "gray.300"}
                fontSize="13px"
                fontWeight="600"
              >
                {done ? "✓" : s.id}
              </Flex>
              <Text
                fontSize="12px"
                fontWeight={active ? "600" : "500"}
                color={active || done ? "gray.500" : "gray.300"}
                display={{ base: "none", sm: "block" }}
              >
                {s.label}
              </Text>
            </Flex>
            {i < steps.length - 1 && (
              <Box
                flex="1"
                h="1px"
                bg={done ? "primary.300" : "gray.100"}
                mx="2"
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}
