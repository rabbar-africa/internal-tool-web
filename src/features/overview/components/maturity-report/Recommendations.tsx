import { Flex, Separator, Text } from "@chakra-ui/react";

export const Recommendations = () => {
  return (
    <Flex
      bg="white"
      p="30px"
      width="100%"
      borderRadius="10px"
      flexDirection="column"
    >
      <Text textStyle="default-semibold">Findings & Recommendations</Text>
      <Separator borderColor="gray.50" my="18px" />
      <Flex flexDirection="column" gap="18px" width="100%">
        <Flex flexDirection="column" gap="6px">
          <Text textStyle="tiny-semibold">
            Area: Risk Management (Level 1 - Initial)
          </Text>
          <Text textStyle="tiny-regular">
            <b>Finding: </b>Risk assessments are conducted ad-hoc, lack
            standardized templates, and mitigation tracking is inconsistent.
          </Text>
          <Text textStyle="tiny-regular">
            <b>Recommendation: </b>Implement standardized DPIA/PIA templates
            within . Mandate their use for all new high-risk projects and
            enforce mitigation tracking via the platform.
          </Text>
          <Text textStyle="tiny-semibold" cursor="pointer" color="primary.300">
            Link to relevant settings/module
          </Text>
        </Flex>
        <Flex flexDirection="column" gap="6px">
          <Text textStyle="tiny-semibold">
            Area: Vendor Management (Level 2 - Managed)
          </Text>
          <Text textStyle="tiny-regular">
            <b>Finding: </b>DPA collection is inconsistent, and contract expiry
            tracking relies on manual reminders.
          </Text>
          <Text textStyle="tiny-regular">
            <b>Recommendation: </b>Utilize the Contract Repository to track all
            DPAs and configure automated expiry reminders for all active vendor
            contracts.
          </Text>
          <Text textStyle="tiny-semibold" cursor="pointer" color="primary.300">
            Link to Contract Repository
          </Text>
        </Flex>
        <Flex flexDirection="column" gap="6px">
          <Text textStyle="tiny-semibold">
            Area: Data Inventory & RoPA (Level 2 - Managed)
          </Text>
          <Text textStyle="tiny-regular">
            <b>Finding: </b>RoPA records are updated manually and may lag behind
            system changes.
          </Text>
          <Text textStyle="tiny-regular">
            <b>Recommendation: </b>Explore potential integrations or develop
            procedures to automate RoPA updates based on changes in data
            processing activities or system deployments.
          </Text>
          <Text textStyle="tiny-semibold" cursor="pointer" color="primary.300">
            Link to ROPA Module
          </Text>
        </Flex>
      </Flex>
    </Flex>
  );
};
