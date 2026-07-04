import { useRef, useState } from "react";
import {
  Box,
  Button,
  Field,
  Flex,
  IconButton,
  Link,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { UploadSimple } from "@/assets/custom/UploadSimple";
import { uploadFile, type UploadedFileMeta } from "../api/service";
import { formatFileSize } from "../utils/paperwork";

interface FileUploadFieldProps {
  label?: string;
  /** Current file, if any (create leaves this empty; edit/renew may prefill). */
  value?: {
    fileUrl?: string | null;
    fileName?: string | null;
    fileSize?: number | null;
  };
  onChange: (meta: UploadedFileMeta | null) => void;
  helperText?: string;
  /** Cloudinary destination folder. */
  folder?: string;
}

// Matches the backend's allowed MIME types (images + PDF, ≤10MB).
const ACCEPT = ".pdf,.jpg,.jpeg,.png,.webp,.gif";

export function FileUploadField({
  label = "Digital copy",
  value,
  onChange,
  helperText = "PDF or image of the scanned document (optional).",
  folder = "paperwork",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasFile = Boolean(value?.fileUrl);

  const handleSelect = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const meta = await uploadFile(file, folder);
      if (!meta.fileUrl) throw new Error("Upload did not return a file URL");
      onChange(meta);
    } catch {
      setError("Upload failed. Please try again.");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

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
        accept={ACCEPT}
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleSelect(file);
        }}
      />

      {hasFile ? (
        <Flex
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
              <Link
                href={value?.fileUrl ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                fontSize="13px"
                color="primary.500"
                fontWeight="500"
                truncate
                display="block"
              >
                {value?.fileName || "View document"}
              </Link>
              {formatFileSize(value?.fileSize) && (
                <Text fontSize="11px" color="gray.300">
                  {formatFileSize(value?.fileSize)}
                </Text>
              )}
            </Box>
          </Flex>
          <Flex align="center" gap="1" flexShrink={0}>
            <Button
              type="button"
              size="xs"
              variant="ghost"
              color="gray.400"
              fontWeight="500"
              onClick={() => inputRef.current?.click()}
              _hover={{ color: "primary.500" }}
            >
              Replace
            </Button>
            <IconButton
              aria-label="Remove file"
              size="xs"
              variant="ghost"
              color="gray.400"
              onClick={() => onChange(null)}
            >
              ✕
            </IconButton>
          </Flex>
        </Flex>
      ) : (
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
                Click to upload a scan
              </Text>
            </>
          )}
        </Flex>
      )}

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
