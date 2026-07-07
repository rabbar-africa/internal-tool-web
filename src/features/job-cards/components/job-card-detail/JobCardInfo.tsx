import { Box, Grid, Link, Stack, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import moment from "moment";
import { RouteConstants } from "@/shared/constants/routes";
import {
  jobCardVehicleLabel,
  type JobCardDetail,
} from "@/shared/interface/job-card";

function InfoItem({
  label,
  value,
  to,
}: {
  label: string;
  value?: string | number | null;
  /** When set (and a value exists), render the value as a link to this route. */
  to?: string;
}) {
  const isEmpty = value === null || value === undefined || value === "";
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
      {!isEmpty && to ? (
        <Link
          asChild
          textStyle="small-regular"
          color="primary.400"
          fontWeight="500"
          _hover={{ textDecoration: "underline" }}
        >
          <RouterLink to={to}>{value}</RouterLink>
        </Link>
      ) : (
        <Text textStyle="small-regular" color="gray.500">
          {isEmpty ? "—" : value}
        </Text>
      )}
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
          <InfoItem
            label="Customer"
            value={jobCard.customerName}
            to={
              jobCard.clientId
                ? RouteConstants.customers.detail.generate({
                    id: jobCard.clientId,
                  })
                : undefined
            }
          />
          <InfoItem label="Phone" value={jobCard.customerPhone} />
          <InfoItem label="Vehicle" value={jobCardVehicleLabel(jobCard)} />
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
