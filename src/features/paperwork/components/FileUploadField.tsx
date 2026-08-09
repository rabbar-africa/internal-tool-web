import { useRef, useState } from "react";
import {
  Box,
  Field,
  Flex,
  IconButton,
  Link,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { UploadSimple } from "@/assets/custom/UploadSimple";
import {
  ACCEPTED_FILE_TYPES,
  attachmentKey,
  attachmentName,
  attachmentSize,
  attachmentUrl,
  MAX_FILE_SIZE,
  pendingAttachment,
  type PaperworkAttachment,
} from "../utils/attachments";
import { formatFileSize } from "../utils/paperwork";

interface FileUploadFieldProps {
  label?: string;
  /** Every scan attached to the form — saved ones and newly picked ones. */
  value: PaperworkAttachment[];
  onChange: (attachments: PaperworkAttachment[]) => void;
  /** True while the form is uploading these on submit. */
  uploading?: boolean;
  helperText?: string;
}

export function FileUploadField({
  label = "Digital copies",
  value,
  onChange,
  uploading = false,
  helperText = "PDFs or images of the scanned documents (optional). You can add several — they upload when you save.",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (selected: File[]) => {
    const tooBig = selected.filter((f) => f.size > MAX_FILE_SIZE);
    const accepted = selected.filter((f) => f.size <= MAX_FILE_SIZE);

    setError(
      tooBig.length
        ? `${tooBig.map((f) => f.name).join(", ")} exceeded the 10MB limit.`
        : null,
    );
    if (accepted.length)
      onChange([...value, ...accepted.map(pendingAttachment)]);
  };

  const removeAt = (index: number) =>
    onChange(value.filter((_, i) => i !== index));

  return (
    <Field.Root gap={0}>
      {label && (
        <Field.Label mb=".625rem" textStyle="tiny-semibold" color="gray.300">
          {label}
        </Field.Label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        multiple
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files ?? []);
          if (files.length) handleSelect(files);
          e.target.value = ""; // let the same file be re-picked after removal
        }}
      />

      <Stack gap="2" w="100%">
        {value.map((attachment, index) => {
          const url = attachmentUrl(attachment);
          const name = attachmentName(attachment);
          const size = formatFileSize(attachmentSize(attachment));

          return (
            <Flex
              key={attachmentKey(attachment)}
              align="center"
              justify="space-between"
              gap="3"
              borderWidth="1px"
              borderColor="gray.100"
              rounded="md"
              px="3"
              py="2.5"
            >
              <Flex align="center" gap="2.5" minW="0">
                <FileTextIcon width="20px" height="20px" color="primary.400" />
                <Box minW="0">
                  {url ? (
                    <Link
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      fontSize="13px"
                      color="primary.500"
                      fontWeight="500"
                      truncate
                      display="block"
                    >
                      {name}
                    </Link>
                  ) : (
                    <Text
                      fontSize="13px"
                      color="gray.500"
                      fontWeight="500"
                      truncate
                    >
                      {name}
                    </Text>
                  )}
                  <Text fontSize="11px" color="gray.300">
                    {[size, url ? null : "Uploads when you save"]
                      .filter(Boolean)
                      .join(" · ")}
                  </Text>
                </Box>
              </Flex>
              <IconButton
                aria-label={`Remove ${name}`}
                size="xs"
                variant="ghost"
                color="gray.400"
                flexShrink={0}
                disabled={uploading}
                onClick={() => removeAt(index)}
              >
                ✕
              </IconButton>
            </Flex>
          );
        })}

        <Flex
          role="button"
          align="center"
          justify="center"
          gap="2"
          borderWidth="1px"
          borderStyle="dashed"
          borderColor={error ? "error.300" : "gray.100"}
          rounded="md"
          px="3"
          py="3"
          w="100%"
          cursor={uploading ? "default" : "pointer"}
          _hover={{ borderColor: uploading ? undefined : "primary.300" }}
          onClick={() => !uploading && inputRef.current?.click()}
        >
          {uploading ? (
            <>
              <Spinner size="sm" color="primary.400" />
              <Text fontSize="13px" color="gray.400">
                Uploading…
              </Text>
            </>
          ) : (
            <>
              <UploadSimple width="18px" height="18px" color="gray.400" />
              <Text fontSize="13px" color="gray.400">
                {value.length ? "Add another scan" : "Click to select scans"}
              </Text>
            </>
          )}
        </Flex>
      </Stack>

      {error ? (
        <Text mt=".375rem" fontSize=".625rem" color="error.400">
          {error}
        </Text>
      ) : (
        helperText && (
          <Text mt=".375rem" fontSize=".625rem" color="gray.300">
            {helperText}
          </Text>
        )
      )}
    </Field.Root>
  );
}
