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
import type { IPaperwork } from "@/shared/interface/paperwork";
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

function FileRow({
  fileUrl,
  fileName,
  fileSize,
}: {
  fileUrl?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
}) {
  if (!fileUrl) return null;
  return (
    <Flex
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
          href={fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          fontSize="13px"
          color="primary.500"
          fontWeight="500"
          truncate
          display="block"
        >
          {fileName || "View document"}
        </Link>
        {formatFileSize(fileSize) && (
          <Text fontSize="11px" color="gray.300">
            {formatFileSize(fileSize)}
          </Text>
        )}
      </Box>
    </Flex>
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

                  {doc.fileUrl && (
                    <Box>
                      <Text
                        fontSize="11px"
                        color="gray.300"
                        textTransform="uppercase"
                        letterSpacing="0.03em"
                        mb="2"
                      >
                        Digital Copy
                      </Text>
                      <FileRow
                        fileUrl={doc.fileUrl}
                        fileName={doc.fileName}
                        fileSize={doc.fileSize}
                      />
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
                                Archived {formatDate(r.createdAt)}
                              </Text>
                            </Flex>
                            {r.referenceNumber && (
                              <Text fontSize="11px" color="gray.300">
                                Ref: {r.referenceNumber}
                              </Text>
                            )}
                            <Box mt={r.fileUrl ? "2" : "0"}>
                              <FileRow
                                fileUrl={r.fileUrl}
                                fileName={r.fileName}
                                fileSize={r.fileSize}
                              />
                            </Box>
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
