import { useMemo, useState } from "react";
import { Badge, Box, Button, Card, Flex, Input, Text } from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import type {
  ChecklistItemStatus,
  GroupedChecklistItems,
  IChecklistItem,
} from "@/shared/interface/inspection";
import {
  useGetGroupedChecklistItemsQuery,
  useSeedDefaultChecklistMutation,
} from "../../api/checklists.query";
import {
  CHECKLIST_STATUS_META,
  CHECKLIST_STATUS_ORDER,
  checklistProgress,
} from "../../util/inspection";
import type { InspectionFormApi } from "./useInspectionForm";

/** Tri-state control — one tap per state, no dropdown to open. */
function StatusToggle({
  value,
  onChange,
}: {
  value: ChecklistItemStatus;
  onChange: (status: ChecklistItemStatus) => void;
}) {
  return (
    <Flex gap="1" flexShrink={0}>
      {CHECKLIST_STATUS_ORDER.map((status) => {
        const meta = CHECKLIST_STATUS_META[status];
        const active = value === status;
        return (
          <Button
            key={status}
            type="button"
            size="2xs"
            variant={active ? "solid" : "outline"}
            bg={active ? meta.bg : "transparent"}
            color={active ? meta.color : "gray.300"}
            borderColor={active ? meta.color : "gray.100"}
            borderWidth="1px"
            fontWeight={active ? "600" : "400"}
            minW="2.75rem"
            onClick={() => onChange(status)}
          >
            {meta.short}
          </Button>
        );
      })}
    </Flex>
  );
}

function ChecklistRow({
  item,
  status,
  notes,
  onStatusChange,
  onNotesChange,
}: {
  item: IChecklistItem;
  status: ChecklistItemStatus;
  notes: string;
  onStatusChange: (status: ChecklistItemStatus) => void;
  onNotesChange: (notes: string) => void;
}) {
  // A note only earns its space once the item is actually flagged.
  const showNotes = status === "NEEDS_FIX" || Boolean(notes);

  return (
    <Box borderBottomWidth="1px" borderColor="gray.50" py="2.5">
      <Flex align="center" justify="space-between" gap="3">
        <Flex align="center" gap="2" minW="0">
          <Text fontSize="13px" color="gray.500" truncate>
            {item.name}
          </Text>
          {item.isRequired ? (
            <Badge
              size="xs"
              bg="red.50"
              color="red.600"
              fontSize="9px"
              flexShrink={0}
            >
              REQUIRED
            </Badge>
          ) : null}
        </Flex>
        <StatusToggle value={status} onChange={onStatusChange} />
      </Flex>

      {showNotes ? (
        <Input
          mt="2"
          size="sm"
          fontSize="13px"
          placeholder="What's wrong with it?"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      ) : null}
    </Box>
  );
}

/**
 * The org's checklist catalog, grouped by category. Every inspection carries
 * the whole catalog; items left untouched stay NOT_APPLICABLE ("not checked").
 */
export function ChecklistSection({ form }: { form: InspectionFormApi }) {
  const { values, setFieldValue } = form.formik;
  const { data, isLoading } = useGetGroupedChecklistItemsQuery();
  const { mutateAsync: seedDefaults, isPending: isSeeding } =
    useSeedDefaultChecklistMutation();
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const grouped: GroupedChecklistItems = data?.data ?? data ?? {};
  const categories = Object.keys(grouped);

  const allItems = useMemo(
    () => categories.flatMap((category) => grouped[category] ?? []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data],
  );

  const progress = checklistProgress(allItems, values.checklistAnswers);

  const setAnswer = (
    itemId: string,
    patch: Partial<{ status: ChecklistItemStatus; notes: string }>,
  ) => {
    const current = values.checklistAnswers[itemId] ?? {
      status: "NOT_APPLICABLE" as ChecklistItemStatus,
      notes: "",
    };
    void setFieldValue("checklistAnswers", {
      ...values.checklistAnswers,
      [itemId]: { ...current, ...patch },
    });
  };

  const setCategory = (category: string, status: ChecklistItemStatus) => {
    const next = { ...values.checklistAnswers };
    (grouped[category] ?? []).forEach((item) => {
      next[item.id] = { ...(next[item.id] ?? { notes: "" }), status };
    });
    void setFieldValue("checklistAnswers", next);
  };

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Flex justify="space-between" align="center" gap="3" wrap="wrap">
          <Box>
            <Text fontWeight="600" color="gray.500" fontSize=".875rem">
              Inspection Checklist{" "}
              <Text as="span" color="gray.200" fontWeight="400">
                (Optional)
              </Text>
            </Text>
            <Text fontSize="11px" color="gray.300" mt="0.5">
              {progress.answered} of {progress.total} checked
              {progress.needsFix > 0
                ? ` · ${progress.needsFix} need fixing`
                : ""}
            </Text>
          </Box>

          {progress.requiredOutstanding.length > 0 ? (
            <Badge size="sm" bg="orange.50" color="orange.600">
              {progress.requiredOutstanding.length} required outstanding
            </Badge>
          ) : null}
        </Flex>
      </Card.Header>

      <Card.Body>
        {isLoading ? (
          <SectionLoader />
        ) : categories.length === 0 ? (
          <Flex direction="column" align="center" gap="3" py="4">
            <Text fontSize="13px" color="gray.300" textAlign="center">
              No checklist set up yet. Add the standard vehicle checklist to
              start ticking items off.
            </Text>
            <Button
              size="sm"
              variant="outline"
              loading={isSeeding}
              loadingText="Adding..."
              onClick={() => void seedDefaults()}
            >
              Add standard checklist
            </Button>
          </Flex>
        ) : (
          categories.map((category) => {
            const items = grouped[category] ?? [];
            const isOpen = openCategory === category;
            const done = items.filter(
              (item) =>
                (values.checklistAnswers[item.id]?.status ??
                  "NOT_APPLICABLE") !== "NOT_APPLICABLE",
            ).length;

            return (
              <Box
                key={category}
                borderWidth="1px"
                borderColor="gray.75"
                rounded="md"
                mb="2"
              >
                <Flex
                  role="button"
                  w="100%"
                  align="center"
                  justify="space-between"
                  px="3"
                  py="2.5"
                  cursor="pointer"
                  onClick={() => setOpenCategory(isOpen ? null : category)}
                >
                  <Flex align="center" gap="2">
                    <Text fontSize="13px" fontWeight="600" color="gray.500">
                      {category}
                    </Text>
                    <Text fontSize="11px" color="gray.300">
                      {done}/{items.length}
                    </Text>
                  </Flex>
                  <Text fontSize="11px" color="gray.300">
                    {isOpen ? "Hide" : "Show"}
                  </Text>
                </Flex>

                {isOpen ? (
                  <Box px="3" pb="3">
                    <Flex justify="flex-end" mb="1">
                      <Button
                        type="button"
                        size="2xs"
                        variant="ghost"
                        color="gray.400"
                        onClick={() => setCategory(category, "OK")}
                      >
                        Mark all OK
                      </Button>
                    </Flex>
                    {items.map((item) => {
                      const answer = values.checklistAnswers[item.id];
                      return (
                        <ChecklistRow
                          key={item.id}
                          item={item}
                          status={answer?.status ?? "NOT_APPLICABLE"}
                          notes={answer?.notes ?? ""}
                          onStatusChange={(status) =>
                            setAnswer(item.id, { status })
                          }
                          onNotesChange={(notes) =>
                            setAnswer(item.id, { notes })
                          }
                        />
                      );
                    })}
                  </Box>
                ) : null}
              </Box>
            );
          })
        )}
      </Card.Body>
    </Card.Root>
  );
}
