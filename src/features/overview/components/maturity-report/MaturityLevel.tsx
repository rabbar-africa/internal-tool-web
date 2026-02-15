import { Flex, Separator, Text } from "@chakra-ui/react";
import { MaturityBars } from "./MaturityBars";

export const MaturityLevel = () => {
  return (
    <Flex bg="white" width="100%" borderRadius="10px" flexDirection="column">
      <Flex align="center" p="15px 0 20px 29px">
        <Text textStyle="default-semibold">Overall Maturity Level</Text>
      </Flex>
      <Separator borderColor="gray.50" />
      <Flex p="24px 35px 35px 37px" gap="40px">
        <Flex flexDirection="column" alignItems="center">
          <MaturityBars />
          <Text textStyle="small-semibold" mt="20px">
            Current Level: Managed
          </Text>
        </Flex>
        <Flex flexDirection="column" mt="15px">
          <Text textStyle="small-regular">
            Your privacy program is currently assessed at the
            <b> Managed</b> level. This indicates that processes are generally
            documented, practiced, and measured, but there may be
            inconsistencies or areas for further optimization and proactive
            improvement.
          </Text>
          <Text mt="21px" textStyle="small-regular">
            Focusing on the recommendations below will help progress towards the
            'Defined' and 'Optimised' levels.
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
