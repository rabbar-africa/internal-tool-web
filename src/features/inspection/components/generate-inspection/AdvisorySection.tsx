import { Badge, Box, Button, Card, Flex, Input, Text } from "@chakra-ui/react";
import { CustomInput } from "@/components/input/CustomInput";
import { CustomSelect } from "@/components/input/CustomSelect";
import { CustomTextArea } from "@/components/input/CustomTextArea";
import type {
  AdvisoryGroup,
  IAdvisory,
  IAdvisoryFinding,
} from "@/shared/interface/inspection";
import { useDraftAdvisoryMutation } from "../../api/query";
import {
  ADVISORY_GROUP_META,
  ADVISORY_GROUP_OPTIONS,
  formatDeadline,
} from "../../util/inspection";
import type { InspectionFormApi } from "./useInspectionForm";

const EMPTY_ADVISORY: IAdvisory = {
  verdict: { headline: "", summary: "" },
  findings: [],
};

function AdvisoryFindingCard({
  finding,
  onChange,
  onRemove,
}: {
  finding: IAdvisoryFinding;
  onChange: (patch: Partial<IAdvisoryFinding>) => void;
  onRemove: () => void;
}) {
  const meta =
    ADVISORY_GROUP_META[finding.group] ?? ADVISORY_GROUP_META.due_soon;

  return (
    <Box
      borderWidth="1px"
      borderColor={meta.border}
      bg={meta.bg}
      rounded="md"
      p="3"
      mb="2.5"
    >
      <Flex gap="3" align="flex-start" justify="space-between" mb="2">
        <Input
          size="sm"
          bg="white"
          fontSize="13px"
          fontWeight="600"
          placeholder="Customer-facing title"
          value={finding.title}
          onChange={(e) => onChange({ title: e.target.value })}
        />
        <Button
          type="button"
          size="2xs"
          variant="ghost"
          color="gray.400"
          flexShrink={0}
          onClick={onRemove}
        >
          Remove
        </Button>
      </Flex>

      {finding.components.length > 0 ? (
        <Flex gap="1" wrap="wrap" mb="2">
          {finding.components.map((component) => (
            <Badge key={component} size="xs" bg="white" color="gray.400">
              {component}
            </Badge>
          ))}
        </Flex>
      ) : null}

      <Flex gap="3" mb="2" direction={{ base: "column", md: "row" }}>
        <Box flex="1">
          <CustomSelect
            label="Urgency"
            options={ADVISORY_GROUP_OPTIONS}
            value={[finding.group]}
            onChange={(opt: { value: string[] }) =>
              onChange({
                group: (opt?.value?.[0] ?? "due_soon") as AdvisoryGroup,
              })
            }
            rootProps={{ size: "sm" }}
          />
        </Box>
        <Box flex="1">
          <CustomInput
            label="Days left"
            placeholder="e.g. 30"
            inputProps={{ inputMode: "numeric" }}
            value={finding.maxDurationLeft ?? ""}
            onChange={(e) => {
              // Digits only — the field maps to an integer day count.
              const raw = e.target.value.replace(/\D/g, "");
              onChange({
                maxDurationLeft: raw === "" ? undefined : Number(raw),
              });
            }}
            helperText={formatDeadline(finding.maxDurationLeft)}
          />
        </Box>
      </Flex>

      <CustomTextArea
        label="What was found"
        rows={2}
        value={finding.observation}
        onChange={(e) => onChange({ observation: e.target.value })}
      />

      {finding.group !== "completed" ? (
        <Box mt="2">
          <CustomTextArea
            label="If left unfixed"
            rows={2}
            placeholder="What happens if the customer ignores this?"
            value={finding.danger ?? ""}
            onChange={(e) => onChange({ danger: e.target.value })}
          />
        </Box>
      ) : null}
    </Box>
  );
}

/**
 * The advisory replaces the old free-text AI summary: a verdict plus findings
 * sorted into urgency bands. The AI only ever drafts it — nothing is saved
 * until the technician has reviewed it and submitted the inspection.
 */
export function AdvisorySection({ form }: { form: InspectionFormApi }) {
  const { values, setFieldValue } = form.formik;
  const { mutateAsync: draftAdvisory, isPending } = useDraftAdvisoryMutation();

  const advisory = values.advisory;
  const canDraft = values.findings.some((finding) => finding.component);

  const setAdvisory = (next: IAdvisory | null) =>
    void setFieldValue("advisory", next);

  const handleDraft = async () => {
    const response = await draftAdvisory({
      findings: values.findings.filter((finding) => finding.component),
      vehicleInfo: {
        name: values.vehicleName,
        number: values.vehicleNumber,
        color: values.vehicleColor,
      },
      customerName: values.customerName,
      technicianName: values.technicianName,
      inspectionDate: values.inspectionDate,
    });

    const drafted: IAdvisory | undefined = response?.data ?? response;
    if (drafted?.verdict) setAdvisory(drafted);
  };

  const patchFinding = (index: number, patch: Partial<IAdvisoryFinding>) => {
    if (!advisory) return;
    setAdvisory({
      ...advisory,
      findings: advisory.findings.map((finding, i) =>
        i === index ? { ...finding, ...patch } : finding,
      ),
    });
  };

  const removeFinding = (index: number) => {
    if (!advisory) return;
    setAdvisory({
      ...advisory,
      findings: advisory.findings.filter((_, i) => i !== index),
    });
  };

  const addFinding = () => {
    const base = advisory ?? EMPTY_ADVISORY;
    setAdvisory({
      ...base,
      findings: [
        ...base.findings,
        {
          title: "",
          components: [],
          group: "due_soon",
          observation: "",
        },
      ],
    });
  };

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Flex justify="space-between" align="center" gap="3" wrap="wrap">
          <Box>
            <Text fontWeight="600" color="gray.500" fontSize=".875rem">
              Advisory{" "}
              <Text as="span" color="gray.200" fontWeight="400">
                (Optional)
              </Text>
            </Text>
            <Text fontSize="11px" color="gray.300" mt="0.5">
              What the customer should do, and by when. Draft it with AI, then
              edit before saving.
            </Text>
          </Box>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleDraft}
            loading={isPending}
            loadingText="Drafting..."
            disabled={!canDraft}
          >
            {advisory ? "Re-draft with AI" : "Draft with AI"}
          </Button>
        </Flex>
      </Card.Header>

      <Card.Body>
        {!advisory ? (
          <Text fontSize="13px" color="gray.300" py="2">
            No advisory yet. Record your findings above, then draft one — or{" "}
            <Text
              as="span"
              color="primary.500"
              cursor="pointer"
              textDecoration="underline"
              onClick={() => setAdvisory(EMPTY_ADVISORY)}
            >
              write it yourself
            </Text>
            .
          </Text>
        ) : (
          <>
            <CustomInput
              label="Verdict"
              required
              placeholder="e.g. Not safe to drive until the brakes are done"
              value={advisory.verdict.headline}
              onChange={(e) =>
                setAdvisory({
                  ...advisory,
                  verdict: { ...advisory.verdict, headline: e.target.value },
                })
              }
            />
            <Box mt="3">
              <CustomTextArea
                label="Summary"
                rows={2}
                placeholder="What must happen now, and what can wait"
                value={advisory.verdict.summary}
                onChange={(e) =>
                  setAdvisory({
                    ...advisory,
                    verdict: { ...advisory.verdict, summary: e.target.value },
                  })
                }
              />
            </Box>

            <Flex justify="space-between" align="center" mt="4" mb="2">
              <Text fontSize="12px" fontWeight="600" color="gray.400">
                Advisory items ({advisory.findings.length})
              </Text>
              <Button
                type="button"
                size="2xs"
                variant="ghost"
                color="primary.500"
                onClick={addFinding}
              >
                + Add item
              </Button>
            </Flex>

            {advisory.findings.map((finding, index) => (
              <AdvisoryFindingCard
                key={index}
                finding={finding}
                onChange={(patch) => patchFinding(index, patch)}
                onRemove={() => removeFinding(index)}
              />
            ))}

            <Button
              type="button"
              size="xs"
              variant="ghost"
              color="gray.400"
              mt="1"
              onClick={() => setAdvisory(null)}
            >
              Clear advisory
            </Button>
          </>
        )}
      </Card.Body>
    </Card.Root>
  );
}
