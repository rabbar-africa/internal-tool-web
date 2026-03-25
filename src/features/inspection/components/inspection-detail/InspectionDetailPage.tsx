import {
  Box,
  Button,
  Flex,
  Grid,
  HStack,
  Separator,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import moment from "moment";
import { UserDashboardContainer } from "@/components/hoc";
import { RouteConstants } from "@/shared/constants/routes";
import SectionLoader from "@/components/common/SectionLoader";
import Status from "@/components/common/Status";
import {
  useGetInspectionByIdQuery,
  useDeleteInspectionMutation,
  useDownloadInspectionByIdMutation,
} from "../../api/query";
import type { IInspectionFinding } from "@/shared/interface/inspection";
import {
  ArrowLeft,
  DownloadSimple,
  PoliceCarIcon,
  TrashIcon,
  FileTextIcon,
  NoteIcon,
} from "@/assets/custom";

// ── Helpers ──────────────────────────────────────────────────────────────────

function InfoField({
  label,
  value,
}: {
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <Box>
      <Text
        fontSize="10.5px"
        color="gray.300"
        mb="1"
        fontWeight="600"
        letterSpacing="0.06em"
        textTransform="uppercase"
      >
        {label}
      </Text>
      <Text fontSize="13.5px" color="gray.500" fontWeight="500">
        {value || "—"}
      </Text>
    </Box>
  );
}

function SectionCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
      overflow="hidden"
    >
      <Flex
        px={{ base: "5", md: "6" }}
        py="4"
        align="center"
        gap="3"
        borderBottomWidth="1px"
        borderColor="gray.75"
        bg="gray.50/40"
      >
        <Flex
          w="7"
          h="7"
          bg="primary.50"
          rounded="lg"
          align="center"
          justify="center"
          flexShrink={0}
        >
          {icon}
        </Flex>
        <Text fontSize="13px" fontWeight="600" color="gray.500">
          {title}
        </Text>
      </Flex>
      <Box px={{ base: "5", md: "6" }} py="5">
        {children}
      </Box>
    </Box>
  );
}

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

export function InspectionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: queryData, isLoading } = useGetInspectionByIdQuery(id ?? "");
  const { mutateAsync: deleteInspection, isPending: isDeleting } =
    useDeleteInspectionMutation();
  const { mutateAsync: downloadReport, isPending: isDownloading } =
    useDownloadInspectionByIdMutation();

  const inspection = queryData?.data ?? queryData;

  const handleDelete = async () => {
    if (!id) return;
    await deleteInspection(id);
    navigate(RouteConstants.inspection.base.path);
  };

  const handleDownload = async () => {
    if (!id) return;
    await downloadReport(id);
  };

  if (isLoading) {
    return (
      <UserDashboardContainer py="1.5rem">
        <SectionLoader />
      </UserDashboardContainer>
    );
  }

  if (!inspection) {
    return (
      <UserDashboardContainer py="1.5rem">
        <Text color="gray.400">Inspection not found.</Text>
      </UserDashboardContainer>
    );
  }

  const vehicleLabel = [
    inspection.vehicleYear,
    inspection.vehicleMake,
    inspection.vehicleModel,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <UserDashboardContainer py="1.5rem">
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
                <PoliceCarIcon color="var(--chakra-colors-primary-300)" />
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

            <HStack gap="2" flexWrap="wrap">
              <Button
                size="sm"
                variant="outline"
                borderColor="error.200"
                color="error.300"
                _hover={{ bg: "error.50" }}
                loading={isDeleting}
                onClick={handleDelete}
              >
                <TrashIcon />
                Delete
              </Button>
              <Button
                size="sm"
                bg="primary.300"
                color="white"
                _hover={{ bg: "primary.400" }}
                loading={isDownloading}
                loadingText="Downloading..."
                onClick={handleDownload}
              >
                <DownloadSimple />
                Download PDF
              </Button>
            </HStack>
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
                width={14}
                height={14}
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

        {/* Additional notes */}
        {inspection.generalNotes && (
          <SectionCard
            icon={
              <NoteIcon
                color="var(--chakra-colors-primary-300)"
                width={14}
                height={14}
              />
            }
            title="Additional Notes"
          >
            <Box
              fontSize="13.5px"
              color="gray.500"
              lineHeight="1.7"
              css={{
                "& h3": { fontWeight: "600", marginBottom: "0.5rem" },
                "& ul, & ol": {
                  paddingLeft: "1.25rem",
                  marginBottom: "0.75rem",
                },
                "& li": { marginBottom: "0.25rem" },
                "& strong": { fontWeight: "600" },
              }}
              dangerouslySetInnerHTML={{ __html: inspection.generalNotes }}
            />
          </SectionCard>
        )}
      </Stack>
    </UserDashboardContainer>
  );
}
