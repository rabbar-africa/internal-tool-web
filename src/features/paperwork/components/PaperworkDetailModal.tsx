import {
  Box,
  Button,
  Dialog,
  Flex,
  Grid,
  Link,
  Portal,
  Stack,
  Text,
} from "@chakra-ui/react";
import SectionLoader from "@/components/common/SectionLoader";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import type {
  IPaperwork,
  IPaperworkRenewal,
} from "@/shared/interface/paperwork";
import { useGetPaperworkByIdQuery } from "../api/query";
import {
  formatDate,
  formatDaysUntil,
  formatDocumentType,
  formatFileSize,
} from "../utils/paperwork";
import { PaperworkStatusBadge } from "./PaperworkStatusBadge";

interface PaperworkDetailModalProps {
  open: boolean;
  onClose: () => void;
  paperworkId: string;
  onEdit: (paperwork: IPaperwork) => void;
  onRenew: (paperwork: IPaperwork) => void;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Text
        fontSize="11px"
        color="gray.300"
        textTransform="uppercase"
        letterSpacing="0.03em"
      >
        {label}
      </Text>
      <Text fontSize="13px" color="gray.500" fontWeight="500" mt="0.5">
        {value || "—"}
      </Text>
    </Box>
  );
}

interface DisplayFile {
  id?: string;
  fileUrl: string;
  fileName?: string | null;
  fileSize?: number | null;
}

/** Every scan a renewal preserved, across the snapshot and legacy formats. */
function renewalFiles(renewal: IPaperworkRenewal): DisplayFile[] {
  if (renewal.files?.length) return renewal.files;
  return renewal.fileUrl ? [{ ...renewal, fileUrl: renewal.fileUrl }] : [];
}

/**
 * Live scans are rows with ids; renewal snapshots are plain JSON without them,
 * so this renders either and falls back to the url for its key.
 */
function FileList({ files }: { files?: DisplayFile[] | null }) {
  if (!files?.length) return null;
  return (
    <Stack gap="2">
      {files.map((file, index) => (
        <Flex
          key={file.id ?? `${file.fileUrl}-${index}`}
          align="center"
          gap="2.5"
          borderWidth="1px"
          borderColor="gray.100"
          rounded="md"
          px="3"
          py="2.5"
        >
          <FileTextIcon width="20px" height="20px" color="primary.400" />
          <Box minW="0">
            <Link
              href={file.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              fontSize="13px"
              color="primary.500"
              fontWeight="500"
              truncate
              display="block"
            >
              {file.fileName || "View document"}
            </Link>
            {formatFileSize(file.fileSize) && (
              <Text fontSize="11px" color="gray.300">
                {formatFileSize(file.fileSize)}
              </Text>
            )}
          </Box>
        </Flex>
      ))}
    </Stack>
  );
}

export function PaperworkDetailModal({
  open,
  onClose,
  paperworkId,
  onEdit,
  onRenew,
}: PaperworkDetailModalProps) {
  const { data, isLoading } = useGetPaperworkByIdQuery(paperworkId);
  const doc = data?.data;

  return (
    <Dialog.Root
      open={open}
      onOpenChange={({ open: o }) => {
        if (!o) onClose();
      }}
      placement="center"
      motionPreset="slide-in-bottom"
      scrollBehavior="inside"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="560px">
            <Dialog.Header borderBottomWidth="1px" borderColor="gray.75" pb="4">
              <Flex align="center" gap="3">
                <Dialog.Title fontSize="16px" fontWeight="600" color="gray.500">
                  {doc ? formatDocumentType(doc.documentType) : "Document"}
                </Dialog.Title>
                {doc && <PaperworkStatusBadge status={doc.status} />}
              </Flex>
            </Dialog.Header>

            <Dialog.Body py="5">
              {isLoading || !doc ? (
                <SectionLoader />
              ) : (
                <Stack gap="5">
                  <Grid templateColumns="1fr 1fr" gap="4">
                    <Field label="Customer" value={doc.client?.displayName} />
                    <Field
                      label="Vehicle"
                      value={
                        doc.vehicle
                          ? `${doc.vehicle.make ?? ""} ${doc.vehicle.model ?? ""}${
                              doc.vehicle.registrationNumber
                                ? ` · ${doc.vehicle.registrationNumber}`
                                : ""
                            }`.trim()
                          : undefined
                      }
                    />
                    <Field
                      label="Issue Date"
                      value={formatDate(doc.issueDate)}
                    />
                    <Field
                      label="Expiry Date"
                      value={
                        doc.expiryDate
                          ? `${formatDate(doc.expiryDate)}${
                              formatDaysUntil(doc.daysUntilExpiry)
                                ? ` (${formatDaysUntil(doc.daysUntilExpiry)})`
                                : ""
                            }`
                          : "No expiry"
                      }
                    />
                    <Field label="Issuer" value={doc.issuer} />
                    <Field label="Reference No." value={doc.referenceNumber} />
                  </Grid>

                  {doc.notes && <Field label="Notes" value={doc.notes} />}

                  {doc.files && doc.files.length > 0 && (
                    <Box>
                      <Text
                        fontSize="11px"
                        color="gray.300"
                        textTransform="uppercase"
                        letterSpacing="0.03em"
                        mb="2"
                      >
                        Digital Copies ({doc.files.length})
                      </Text>
                      <FileList files={doc.files} />
                    </Box>
                  )}

                  {/* Renewal history */}
                  {doc.renewals && doc.renewals.length > 0 && (
                    <Box>
                      <Text
                        fontSize="13px"
                        fontWeight="600"
                        color="gray.500"
                        mb="2.5"
                      >
                        Renewal History ({doc.renewals.length})
                      </Text>
                      <Stack gap="2.5">
                        {doc.renewals.map((r) => (
                          <Box
                            key={r.id}
                            borderWidth="1px"
                            borderColor="gray.75"
                            rounded="md"
                            px="3"
                            py="2.5"
                            bg="gray.50/40"
                          >
                            <Flex justify="space-between" gap="3" mb="1">
                              <Text fontSize="12px" color="gray.400">
                                Expired:{" "}
                                <Text
                                  as="span"
                                  fontWeight="600"
                                  color="gray.500"
                                >
                                  {formatDate(r.expiryDate)}
                                </Text>
                              </Text>
                              <Text fontSize="11px" color="gray.300">
                                Archived {formatDate(r.renewedAt)}
                              </Text>
                            </Flex>
                            {r.referenceNumber && (
                              <Text fontSize="11px" color="gray.300">
                                Ref: {r.referenceNumber}
                              </Text>
                            )}
                            {renewalFiles(r).length > 0 && (
                              <Box mt="2">
                                <FileList files={renewalFiles(r)} />
                              </Box>
                            )}
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              )}
            </Dialog.Body>

            <Dialog.Footer borderTopWidth="1px" borderColor="gray.75" pt="4">
              <Flex gap="3" justify="flex-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => doc && onEdit(doc)}
                  disabled={!doc}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => doc && onRenew(doc)}
                  disabled={!doc}
                >
                  Renew
                </Button>
              </Flex>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
