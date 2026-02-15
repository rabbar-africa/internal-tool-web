import { useFormikContext } from "formik";
import { Box, Card, Field, Text } from "@chakra-ui/react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import type { InspectionFormValues } from "./inspection-form.types";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [3, false] }],
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
    ["clean"],
  ],
};

const QUILL_FORMATS = ["header", "bold", "italic", "underline", "list"];

export function AdditionalNotesSection() {
  const { values, setFieldValue } = useFormikContext<InspectionFormValues>();

  return (
    <Card.Root borderColor="gray.75" shadow="none" borderWidth="1px">
      <Card.Header pb="0">
        <Text fontWeight="600" color="gray.500" fontSize=".875rem">
          Additional Notes{" "}
          <Text as="span" color="gray.200" fontWeight="400">
            (Optional)
          </Text>
        </Text>
      </Card.Header>
      <Card.Body>
        <Field.Root gap={0}>
          <Field.Label mb=".625rem" textStyle="tiny-semibold" color="gray.300">
            Notes / Message to Vehicle Owner
          </Field.Label>
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
              value={values.additionalNotes}
              onChange={(content) => {
                void setFieldValue("additionalNotes", content);
              }}
              modules={QUILL_MODULES}
              formats={QUILL_FORMATS}
              placeholder="Type any extra notes or message to the vehicle owner..."
            />
          </Box>
          <Text mt="1" textStyle="xs" color="gray.200">
            Formatting (bold, lists, etc.) will appear in the PDF report.
          </Text>
        </Field.Root>
      </Card.Body>
    </Card.Root>
  );
}
