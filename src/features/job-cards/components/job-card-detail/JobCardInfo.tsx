import { Box, Grid, Stack, Text } from "@chakra-ui/react";
import moment from "moment";
import {
  jobCardVehicleLabel,
  type JobCardDetail,
} from "@/shared/interface/job-card";

function InfoItem({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <Box>
      <Text
        fontSize="11px"
        fontWeight="500"
        color="gray.300"
        textTransform="uppercase"
        letterSpacing="0.05em"
        mb="1"
      >
        {label}
      </Text>
      <Text textStyle="small-regular" color="gray.500">
        {value === null || value === undefined || value === "" ? "—" : value}
      </Text>
    </Box>
  );
}

export function JobCardInfo({ jobCard }: { jobCard: JobCardDetail }) {
  return (
    <Box
      bg="white"
      rounded="xl"
      borderWidth="1px"
      borderColor="gray.75"
      shadow="xs"
      p="5"
    >
      <Stack gap="5">
        <Grid
          templateColumns={{ base: "1fr 1fr", md: "repeat(4, 1fr)" }}
          gap="4"
        >
          <InfoItem label="Customer" value={jobCard.customerName} />
          <InfoItem label="Phone" value={jobCard.customerPhone} />
          <InfoItem label="Vehicle" value={jobCardVehicleLabel(jobCard)} />
          <InfoItem
            label="Odometer"
            value={
              jobCard.odometerIn != null
                ? `${jobCard.odometerIn.toLocaleString()} km in${
                    jobCard.odometerOut != null
                      ? ` / ${jobCard.odometerOut.toLocaleString()} km out`
                      : ""
                  }`
                : null
            }
          />
          <InfoItem
            label="Opened"
            value={moment(jobCard.openedAt).format("DD MMM YYYY")}
          />
          <InfoItem
            label="Promised"
            value={
              jobCard.promisedDate
                ? moment(jobCard.promisedDate).format("DD MMM YYYY")
                : null
            }
          />
          <InfoItem
            label="Closed"
            value={
              jobCard.closedAt
                ? moment(jobCard.closedAt).format("DD MMM YYYY")
                : null
            }
          />
        </Grid>

        <Grid templateColumns={{ base: "1fr", md: "1fr 1fr 1fr" }} gap="4">
          <InfoItem label="Complaint" value={jobCard.complaint} />
          <InfoItem label="Diagnosis Notes" value={jobCard.diagnosisNotes} />
          <InfoItem label="Internal Notes" value={jobCard.notes} />
        </Grid>
      </Stack>
    </Box>
  );
}
