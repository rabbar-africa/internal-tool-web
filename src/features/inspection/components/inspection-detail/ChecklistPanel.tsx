import { Badge, Box, Flex, Stack, Text } from "@chakra-ui/react";
import type { IInspectionChecklist } from "@/shared/interface/inspection";
import { CHECKLIST_STATUS_META } from "../../util/inspection";

/**
 * Every inspection stores the org's whole catalog, most of it untouched. Only
 * the answered items are shown — a wall of "not checked" tells nobody anything.
 */
export function ChecklistPanel({
  checklists,
}: {
  checklists: IInspectionChecklist[];
}) {
  const answered = checklists.filter(
    (entry) => entry.status !== "NOT_APPLICABLE",
  );

  if (answered.length === 0) {
    return (
      <Text fontSize="13px" color="gray.300">
        No checklist items were filled in for this inspection.
      </Text>
    );
  }

  const byCategory = answered.reduce<Record<string, IInspectionChecklist[]>>(
    (acc, entry) => {
      const category = entry.checklistItem?.category ?? "Other";
      (acc[category] ??= []).push(entry);
      return acc;
    },
    {},
  );

  const skipped = checklists.length - answered.length;

  return (
    <Stack gap="4">
      {Object.entries(byCategory).map(([category, entries]) => (
        <Box key={category}>
          <Text
            fontSize="11px"
            fontWeight="600"
            color="gray.300"
            textTransform="uppercase"
            letterSpacing="0.05em"
            mb="2"
          >
            {category}
          </Text>
          <Stack gap="0">
            {entries.map((entry) => {
              const meta = CHECKLIST_STATUS_META[entry.status];
              return (
                <Box
                  key={entry.id}
                  borderBottomWidth="1px"
                  borderColor="gray.50"
                  py="2"
                >
                  <Flex align="center" justify="space-between" gap="3">
                    <Text fontSize="13px" color="gray.500">
                      {entry.checklistItem?.name}
                    </Text>
                    <Badge
                      size="sm"
                      bg={meta.bg}
                      color={meta.color}
                      flexShrink={0}
                    >
                      {meta.label}
                    </Badge>
                  </Flex>
                  {entry.notes ? (
                    <Text fontSize="12.5px" color="gray.400" mt="1">
                      {entry.notes}
                    </Text>
                  ) : null}
                </Box>
              );
            })}
          </Stack>
        </Box>
      ))}

      {skipped > 0 ? (
        <Text fontSize="11px" color="gray.300">
          {skipped} other checklist {skipped === 1 ? "item was" : "items were"}{" "}
          not checked.
        </Text>
      ) : null}
    </Stack>
  );
}
