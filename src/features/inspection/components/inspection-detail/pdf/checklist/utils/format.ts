import moment from "moment";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";

export const formatReportDate = (value?: string): string =>
  value ? moment(value).format("DD MMM YYYY") : "";

/** "2014 MINI Cooper · Black", dropping whichever parts are missing. */
export function vehicleLine(inspection: IInspection): string {
  const name = [
    inspection.vehicleYear,
    inspection.vehicleMake,
    inspection.vehicleModel,
  ]
    .filter(Boolean)
    .join(" ");
  return [name, inspection.vehicleColor].filter(Boolean).join(" · ");
}

const isFilled = (value?: string | null): value is string => Boolean(value);

/** The footer's three columns, each already stripped of blank lines. */
export function organizationContact(organization?: IOrganization) {
  const address = organization?.primaryAddress;

  const workshopLines = [
    address?.addressLine1 || organization?.addressLine1,
    [
      address?.addressLine2 || organization?.addressLine2,
      address?.city || organization?.city,
      address?.state || organization?.state,
    ]
      .filter(Boolean)
      .join(", "),
  ].filter(isFilled);

  const contactLines = [
    organization?.phone,
    organization?.companyEmail || organization?.email,
  ].filter(isFilled);

  const companyLines = [
    organization?.website,
    organization?.rcNumber ? `RC ${organization.rcNumber}` : undefined,
  ].filter(isFilled);

  return { workshopLines, contactLines, companyLines };
}
