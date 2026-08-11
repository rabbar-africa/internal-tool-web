import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/react";
import type {
  AdvisoryGroup,
  IAdvisory,
  IAdvisoryFinding,
} from "@/shared/interface/inspection";
import { ADVISORY_GROUP_META, formatDeadline } from "../../util/inspection";

const GROUP_ORDER: AdvisoryGroup[] = [
  "fix_now",
  "due_soon",
  "optional",
  "completed",
];

function AdvisoryItem({ finding }: { finding: IAdvisoryFinding }) {
  const meta = ADVISORY_GROUP_META[finding.group];
  const deadline = formatDeadline(finding.maxDurationLeft);

  return (
    <Box
      borderWidth="1px"
      borderColor={meta.border}
      bg={meta.bg}
      rounded="md"
      p="3"
    >
      <Flex justify="space-between" align="flex-start" gap="3" mb="1">
        <Text fontSize="13.5px" fontWeight="600" color="gray.500">
          {finding.title}
        </Text>
        {deadline ? (
          <Text
            fontSize="11px"
            fontWeight="600"
            color={meta.color}
            flexShrink={0}
          >
            {deadline}
          </Text>
        ) : null}
      </Flex>

      {finding.observation ? (
        <Text fontSize="13px" color="gray.400" lineHeight="1.6">
          {finding.observation}
        </Text>
      ) : null}

      {finding.danger ? (
        <Text fontSize="12.5px" color={meta.color} mt="1.5" lineHeight="1.6">
          If left: {finding.danger}
        </Text>
      ) : null}

      {finding.components.length > 0 ? (
        <Flex gap="1" wrap="wrap" mt="2">
          {finding.components.map((component) => (
            <Badge key={component} size="xs" bg="white" color="gray.400">
              {component}
            </Badge>
          ))}
        </Flex>
      ) : null}
    </Box>
  );
}

/** The customer-facing verdict and its findings, worst urgency first. */
export function AdvisoryPanel({ advisory }: { advisory: IAdvisory }) {
  const bands = GROUP_ORDER.map((group) => ({
    group,
    items: advisory.findings.filter((finding) => finding.group === group),
  })).filter((band) => band.items.length > 0);

  return (
    <Stack gap="4">
      <Box borderWidth="1px" borderColor="gray.75" rounded="md" p="3.5">
        <Text fontSize="15px" fontWeight="600" color="gray.500">
          {advisory.verdict.headline}
        </Text>
        {advisory.verdict.summary ? (
          <Text fontSize="13px" color="gray.400" mt="1" lineHeight="1.7">
            {advisory.verdict.summary}
          </Text>
        ) : null}
      </Box>

      {bands.map((band) => {
        const meta = ADVISORY_GROUP_META[band.group];
        return (
          <Box key={band.group}>
            <Flex align="baseline" gap="2" mb="2">
              <Text
                fontSize="11px"
                fontWeight="600"
                color={meta.color}
                textTransform="uppercase"
                letterSpacing="0.05em"
              >
                {meta.label}
              </Text>
              <Text fontSize="11px" color="gray.300">
                {meta.hint}
              </Text>
            </Flex>
            <Stack gap="2">
              {band.items.map((finding, i) => (
                <AdvisoryItem key={i} finding={finding} />
              ))}
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
