import { memo, useCallback } from "react";
import { Box, Button, Card, Field, Flex, Text } from "@chakra-ui/react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { useSummarizeInspectionNotesMutation } from "../../api/query";
import type { InspectionFormApi } from "./useInspectionForm";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const QUILL_FORMATS = ["header", "bold", "italic", "underline", "list"];

/**
 * The Quill editor is the most expensive child in the form, and Formik
 * re-renders the whole tree on every keystroke anywhere (e.g. while typing a
 * finding observation). Memoizing the editor on (value, onChange) keeps those
 * keystrokes from re-rendering Quill — `onChange` must be identity-stable for
 * this to work (it is: a useCallback over Formik's stable setFieldValue).
 */
const NotesEditor = memo(function NotesEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: string) => void;
}) {
  return (
    <Box
      borderWidth="1px"
      borderColor="gray.100"
      rounded="md"
      overflow="hidden"
      css={{
        "& .ql-toolbar": {
          borderBottom: "1px solid var(--chakra-colors-gray-100)",
          borderTop: "none",
          borderLeft: "none",
          borderRight: "none",
        },
        "& .ql-container": {
          border: "none",
          minHeight: "120px",
          fontSize: "14px",
          fontFamily: "inherit",
        },
        "& .ql-editor": {
          minHeight: "120px",
          color: "var(--chakra-colors-gray-500)",
        },
        "& .ql-editor.ql-blank::before": {
          color: "var(--chakra-colors-gray-100)",
          fontStyle: "normal",
        },
      }}
    >
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={QUILL_MODULES}
        formats={QUILL_FORMATS}
        placeholder="Type any extra notes or message to the vehicle owner..."
      />
    </Box>
  );
});

/**
 * Free-text notes for anything the structured sections don't cover. These are
 * what the classic PDF renders as "Technician Notes & Recommendations", so the
 * AI summary still lives here alongside the newer advisory.
 */
export function AdditionalNotesSection({ form }: { form: InspectionFormApi }) {
  const { values, setFieldValue } = form.formik;
  const { mutateAsync: summarize, isPending } =
    useSummarizeInspectionNotesMutation();

  // Stable identity (Formik's setFieldValue is stable) so NotesEditor's memo holds.
  const handleNotesChange = useCallback(
    (content: string) => {
      void setFieldValue("additionalNotes", content);
    },
    [setFieldValue],
  );

  const handleAiGenerate = async () => {
    const response = await summarize({
      findings: values.findings.filter((finding) => finding.component),
      // `number`, not `registrationNumber` — the DTO rejects unknown fields.
      vehicleInfo: {
        name: values.vehicleName,
        number: values.vehicleNumber,
        color: values.vehicleColor,
      },
      customerName: values.customerName,
      technicianName: values.technicianName,
      inspectionDate: values.inspectionDate,
      includeActionPlan: true,
      includeUrgency: true,
    });

    const raw: string =
      response?.data?.html ?? response?.html ?? response ?? "";
    // Strip markdown code fences: ```html\n...\n``` or ```\n...\n```
    const html = raw
      .replace(/^```(?:html)?\s*/i, "")
      .replace(/\s*```\s*$/, "")
      .trim();

    if (html) void setFieldValue("additionalNotes", html);
  };

  const canGenerate = values.findings.some((finding) => finding.component);

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Flex justify="space-between" align="center" gap="3" wrap="wrap">
          <Box>
            <Text fontWeight="600" color="gray.500" fontSize=".875rem">
              Additional Notes{" "}
              <Text as="span" color="gray.200" fontWeight="400">
                (Optional)
              </Text>
            </Text>
            <Text fontSize="11px" color="gray.300" mt="0.5">
              Shown on the classic report as technician notes.
            </Text>
          </Box>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={handleAiGenerate}
            loading={isPending}
            loadingText="Generating..."
            disabled={!canGenerate}
          >
            Generate with AI
          </Button>
        </Flex>
      </Card.Header>
      <Card.Body>
        <Field.Root gap={0}>
          <Field.Label mb=".625rem" textStyle="tiny-semibold" color="gray.300">
            Notes / Message to Vehicle Owner
          </Field.Label>
          <NotesEditor
            value={values.additionalNotes}
            onChange={handleNotesChange}
          />
          <Text mt="1" textStyle="xs" color="gray.200">
            Formatting (bold, lists, etc.) will appear in the PDF report.
          </Text>
        </Field.Root>
      </Card.Body>
    </Card.Root>
  );
}
