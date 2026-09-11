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
                w="26px"
                h="26px"
                rounded="full"
                align="center"
                justify="center"
                // Completed steps carry the acid accent; the active one is
                // outlined in navy so it reads as "you are here", not "done".
                bg={done ? "secondary.300" : active ? "white" : "gray.50"}
                borderWidth={active ? "1.5px" : "1px"}
                borderColor={
                  done
                    ? "secondary.300"
                    : active
                      ? "primary.500"
                      : "transparent"
                }
                color={done || active ? "primary.500" : "gray.200"}
                fontSize="12px"
                fontWeight="700"
                transition="all .15s ease"
              >
                {done ? "✓" : s.id}
              </Flex>
              <Text
                fontSize="12px"
                fontWeight={active ? "600" : "500"}
                color={active ? "primary.500" : done ? "gray.400" : "gray.200"}
                display={{ base: "none", sm: "block" }}
                whiteSpace="nowrap"
              >
                {s.label}
              </Text>
            </Flex>
            {i < steps.length - 1 && (
              <Box
                flex="1"
                h="2px"
                rounded="full"
                bg={done ? "secondary.300" : "gray.50"}
                mx="2"
                transition="background .15s ease"
              />
            )}
          </Flex>
        );
      })}
    </Flex>
  );
}
