import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  IconButton,
  Menu,
  Portal,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { RouteConstants } from "@/shared/constants/routes";
import SectionLoader from "@/components/common/SectionLoader";
import Status from "@/components/common/Status";
import {
  useGetInspectionByIdQuery,
  useDeleteInspectionMutation,
  useCompleteInspectionMutation,
} from "@/features/inspection/api/query";
import {
  useInspectionPdf,
  INSPECTION_PDF_VARIANTS,
  type InspectionPdfVariant,
} from "@/features/inspection/hooks/useInspectionPdf";
import type {
  IInspection,
  IInspectionFinding,
} from "@/shared/interface/inspection";
import {
  ArrowLeft,
  PoliceCarIcon,
  ThreeDotsIcon,
  FileTextIcon,
  NoteIcon,
} from "@/assets/custom";
import { SectionCard } from "@/features/inspection/components/inspection-detail/SectionCard";
import { InfoField } from "@/features/inspection/components/inspection-detail/InfoField";
import { AdvisoryPanel } from "@/features/inspection/components/inspection-detail/AdvisoryPanel";
import { ChecklistPanel } from "@/features/inspection/components/inspection-detail/ChecklistPanel";
import ConsentDialog from "@/components/common/ConsentDialog";

// ── Helpers ──────────────────────────────────────────────────────────────────

const FINDING_STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  good: { bg: "success.50", color: "success.300" },
  needs_attention: { bg: "warning.50", color: "secondary.500" },
  worn_out: { bg: "warning.50", color: "secondary.500" },
  needs_repair: { bg: "orange.50", color: "orange.600" },
  needs_replacement: { bg: "error.50", color: "error.300" },
  faulty_repaired: { bg: "blue.50", color: "blue.600" },
  faulty_replaced: { bg: "primary.50", color: "primary.300" },
  damaged: { bg: "error.50", color: "error.300" },
  missing: { bg: "gray.100", color: "gray.400" },
  not_genuine: { bg: "purple.50", color: "purple.600" },
};

function FindingStatusBadge({ status }: { status: string }) {
  const style = FINDING_STATUS_COLORS[status] ?? {
    bg: "gray.100",
    color: "gray.400",
  };
  return (
    <Box
      display="inline-flex"
      bg={style.bg}
      px="8px"
      py="3px"
      rounded="md"
      alignItems="center"
    >
      <Text
        fontSize="11px"
        fontWeight="500"
        color={style.color}
        textTransform="capitalize"
      >
        {status.replace(/_/g, " ")}
      </Text>
    </Box>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function InspectionDetailTemplate() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: queryData, isLoading } = useGetInspectionByIdQuery(id ?? "");
  const { mutateAsync: deleteInspection, isPending: isDeleting } =
    useDeleteInspectionMutation();
  const { mutateAsync: completeInspection, isPending: isCompleting } =
    useCompleteInspectionMutation();
  const {
    download: downloadReport,
    share: shareReport,
    canShareFiles,
    isGenerating,
  } = useInspectionPdf();
  const [isSharing, setIsSharing] = useState(false);

  const inspection = (queryData?.data ?? queryData) as IInspection | undefined;

  const handleDelete = async () => {
    if (!id) return;
    await deleteInspection(id);
    navigate(RouteConstants.inspection.base.path);
  };

  const handleDownload = async (variant: InspectionPdfVariant) => {
    if (inspection) await downloadReport(inspection, variant);
  };

  const handleSend = async (variant: InspectionPdfVariant) => {
    if (!inspection) return;
    setIsSharing(true);
    try {
      await shareReport(inspection, variant);
    } finally {
      setIsSharing(false);
    }
  };

  if (isLoading) {
    return <SectionLoader />;
  }

  if (!inspection) {
    return <Text color="gray.400">Inspection not found.</Text>;
  }

  const vehicleLabel = [
    inspection.vehicleYear,
    inspection.vehicleMake,
    inspection.vehicleModel,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <Stack gap="5">
        {/* Back */}
        <Button
          variant="ghost"
          size="sm"
          alignSelf="flex-start"
          color="gray.400"
          px="0"
          _hover={{ color: "gray.500", bg: "transparent" }}
          onClick={() => navigate(RouteConstants.inspection.base.path)}
        >
          <ArrowLeft />
          Back to Inspections
        </Button>

        {/* Hero header */}
        <Box
          bg="white"
          rounded="2xl"
          overflow="hidden"
          shadow="xs"
          borderWidth="1px"
          borderColor="gray.75"
        >
          <Box
            h="6"
            bgGradient="to-r"
            gradientFrom="primary.100"
            gradientTo="primary.50"
          />

          <Flex
            px={{ base: "5", md: "8" }}
            pb="6"
            pt="4"
            gap="4"
            align={{ base: "flex-start", md: "center" }}
            justify="space-between"
            direction={{ base: "column", md: "row" }}
          >
            <HStack gap="4">
              <Flex
                w="12"
                h="12"
                bg="primary.50"
                rounded="xl"
                align="center"
                justify="center"
                flexShrink={0}
              >
                <PoliceCarIcon
                  w={"1.5rem"}
                  color="var(--chakra-colors-primary-300)"
                />
              </Flex>

              <Box>
                <HStack gap="2" flexWrap="wrap">
                  <Text fontSize="1.1rem" fontWeight="700" color="gray.600">
                    {inspection.jobCode ?? "—"}
                  </Text>
                  <Status name={inspection.status} />
                </HStack>
                <Text fontSize="12px" color="gray.300" mt="1">
                  {vehicleLabel || "—"} &middot;{" "}
                  {moment(inspection.inspectionDate).format("DD MMM YYYY")}
                </Text>
              </Box>
            </HStack>

            <Menu.Root>
              <Menu.Trigger asChild>
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label="Inspection actions"
                  bg="white"
                  border="1px solid"
                  borderColor="gray.75"
                  _hover={{ bg: "gray.50" }}
                  loading={
                    isGenerating || isSharing || isDeleting || isCompleting
                  }
                >
                  <ThreeDotsIcon color="gray.400" />
                </IconButton>
              </Menu.Trigger>
              <Portal>
                <Menu.Positioner>
                  <Menu.Content minW="190px">
                    <Menu.Item
                      value="edit"
                      onClick={() =>
                        navigate(
                          RouteConstants.inspection.edit.generate({
                            id: inspection.id,
                          }),
                        )
                      }
                      _hover={{ bg: "gray.50" }}
                    >
                      Edit inspection
                    </Menu.Item>
                    {inspection.status !== "COMPLETED" && (
                      <Menu.Item
                        value="complete"
                        onClick={() => void completeInspection(inspection.id)}
                        _hover={{ bg: "gray.50" }}
                      >
                        Mark as completed
                      </Menu.Item>
                    )}
                    <Menu.Separator borderColor="gray.50" />
                    {INSPECTION_PDF_VARIANTS.map((variant) => (
                      <Menu.Item
                        key={variant.value}
                        value={`save-${variant.value}`}
                        onClick={() => void handleDownload(variant.value)}
                        _hover={{ bg: "gray.50" }}
                      >
                        Save {variant.label}
                      </Menu.Item>
                    ))}
                    {canShareFiles &&
                      INSPECTION_PDF_VARIANTS.map((variant) => (
                        <Menu.Item
                          key={`send-${variant.value}`}
                          value={`send-${variant.value}`}
                          onClick={() => void handleSend(variant.value)}
                          _hover={{ bg: "gray.50" }}
                        >
                          Send {variant.label}
                        </Menu.Item>
                      ))}
                    <Menu.Separator borderColor="gray.50" />
                    <Menu.Item
                      value="delete"
                      color="error.300"
                      onClick={() => setDeleteDialogOpen(true)}
                      _hover={{ bg: "error.50" }}
                    >
                      Delete inspection
                    </Menu.Item>
                  </Menu.Content>
                </Menu.Positioner>
              </Portal>
            </Menu.Root>
          </Flex>
        </Box>

        {/* Two-column info grid */}
        <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap="4">
          {/* Customer */}
          <SectionCard
            icon={
              <Text color="primary.300" fontSize="xs" fontWeight="700">
                C
              </Text>
            }
            title="Customer"
          >
            <Grid templateColumns="1fr 1fr" gap="4">
              <InfoField label="Name" value={inspection.customerName} />
              <InfoField label="Phone" value={inspection.customerPhone} />
              <InfoField label="Email" value={inspection.customerEmail} />
              {inspection.technicianName && (
                <InfoField
                  label="Technician"
                  value={inspection.technicianName}
                />
              )}
            </Grid>
          </SectionCard>

          {/* Vehicle */}
          <SectionCard
            icon={
              <PoliceCarIcon
                color="var(--chakra-colors-primary-300)"
                w={"1.5rem"}
              />
            }
            title="Vehicle"
          >
            <Grid templateColumns="1fr 1fr" gap="4">
              <InfoField label="Make" value={inspection.vehicleMake} />
              <InfoField label="Model" value={inspection.vehicleModel} />
              <InfoField label="Year" value={inspection.vehicleYear} />
              <InfoField label="Color" value={inspection.vehicleColor} />
              <InfoField
                label="Registration"
                value={
                  inspection.vehicleRegistrationNumber ? (
                    <Text fontFamily="mono" fontSize="13px" color="gray.500">
                      {inspection.vehicleRegistrationNumber}
                    </Text>
                  ) : undefined
                }
              />
              <InfoField
                label="VIN"
                value={
                  inspection.vehicleVin ? (
                    <Text fontFamily="mono" fontSize="12px" color="gray.400">
                      {inspection.vehicleVin}
                    </Text>
                  ) : undefined
                }
              />
            </Grid>
          </SectionCard>
        </Grid>

        {/* Findings */}
        <SectionCard
          icon={
            <FileTextIcon
              color="var(--chakra-colors-primary-300)"
              width={14}
              height={14}
            />
          }
          title={`Inspection Findings (${inspection.findings?.length ?? 0})`}
        >
          <Stack gap="3">
            {(inspection.findings as IInspectionFinding[])?.map(
              (finding, i) => (
                <Box
                  key={i}
                  p="4"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="gray.75"
                  bg="gray.50/50"
                >
                  <Flex
                    justify="space-between"
                    align={{ base: "flex-start", sm: "center" }}
                    gap="3"
                    direction={{ base: "column", sm: "row" }}
                    mb={finding.observation ? "3" : "0"}
                  >
                    <HStack gap="3">
                      <Flex
                        w="6"
                        h="6"
                        bg="primary.300"
                        rounded="full"
                        align="center"
                        justify="center"
                        flexShrink={0}
                      >
                        <Text color="white" fontSize="10px" fontWeight="700">
                          {i + 1}
                        </Text>
                      </Flex>
                      <Text fontSize="13.5px" fontWeight="600" color="gray.500">
                        {finding.component}
                      </Text>
                    </HStack>
                    <FindingStatusBadge status={finding.status} />
                  </Flex>

                  {finding.observation && (
                    <>
                      <Separator borderColor="gray.75" mb="3" />
                      <Text fontSize="12.5px" color="gray.400" lineHeight="1.6">
                        {finding.observation}
                      </Text>
                    </>
                  )}
                </Box>
              ),
            )}

            {(!inspection.findings || inspection.findings.length === 0) && (
              <Text fontSize="13px" color="gray.300" textAlign="center" py="6">
                No findings recorded.
              </Text>
            )}
          </Stack>
        </SectionCard>

        {/* Advisory — what the customer should do, and by when */}
        {inspection.advisory?.verdict ? (
          <SectionCard
            icon={
              <NoteIcon color="var(--chakra-colors-primary-300)" w={"1rem"} />
            }
            title="Advisory"
          >
            <AdvisoryPanel advisory={inspection.advisory} />
          </SectionCard>
        ) : null}

        {/* Checklist */}
        {inspection.inspectionChecklists?.length ? (
          <SectionCard
            icon={
              <NoteIcon color="var(--chakra-colors-primary-300)" w={"1rem"} />
            }
            title="Checklist"
          >
            <ChecklistPanel checklists={inspection.inspectionChecklists} />
          </SectionCard>
        ) : null}

        {/* Additional notes */}
        {inspection.generalNotes && (
          <SectionCard
            icon={
              <NoteIcon color="var(--chakra-colors-primary-300)" w={"1rem"} />
            }
            title="Additional Notes"
          >
            <Box
              fontSize="13.5px"
              color="gray.500"
              lineHeight="1.7"
              overflowX="auto"
              wordBreak="break-word"
              css={{
                "& h3": { fontWeight: "600", marginBottom: "0.5rem" },
                "& ul, & ol": {
                  paddingLeft: "1.25rem",
                  marginBottom: "0.75rem",
                },
                "& li": { marginBottom: "0.25rem" },
                "& strong": { fontWeight: "600" },
                "& table": {
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                },
                "& table td, & table th": {
                  padding: "0.4rem 0.6rem",
                  border: "1px solid var(--chakra-colors-gray-75)",
                },
                "& img": { maxWidth: "100%", height: "auto" },
              }}
              dangerouslySetInnerHTML={{ __html: inspection.generalNotes }}
            />
          </SectionCard>
        )}
      </Stack>

      <ConsentDialog
        open={deleteDialogOpen}
        onOpenChange={({ open }) => setDeleteDialogOpen(open)}
        heading="Delete this inspection?"
        note="This action cannot be undone. The inspection report will be permanently removed."
        confirmText="Yes, Delete"
        handleSubmit={handleDelete}
        isLoading={isDeleting}
        variant="danger"
      />
    </>
  );
}
