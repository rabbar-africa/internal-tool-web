import moment from "moment";
import type { IOrganization } from "@/shared/interface/common";
import type { IInspection } from "@/shared/interface/inspection";

export const formatReportDate = (value?: string): string =>
  value ? moment(value).format("DD MMM, YYYY") : "";

/** "2020 Honda Accord", dropping whichever parts are missing. */
export function vehicleTitle(inspection: IInspection): string {
  const name = [inspection.vehicleMake, inspection.vehicleModel]
    .filter(Boolean)
    .join(" ");
  return inspection.vehicleYear
    ? `${inspection.vehicleYear} ${name}`.trim()
    : name;
}

const isFilled = (value?: string | null): value is string => Boolean(value);

/**
 * The footer's two columns. Organizations carry their address both inline and
 * on `primaryAddress`, so each line prefers the structured record and falls
 * back to the flat field. Blank lines are dropped rather than left as gaps.
 */
export function organizationContact(organization?: IOrganization) {
  const address = organization?.primaryAddress;

  const contactLines = [
    organization?.phone,
    organization?.phone2,
    organization?.companyEmail || organization?.email,
    organization?.website,
  ].filter(isFilled);

  const addressLines = [
    address?.addressLine1 || organization?.addressLine1,
    address?.addressLine2 || organization?.addressLine2,
    [address?.city || organization?.city, address?.state || organization?.state]
      .filter(Boolean)
      .join(", "),
  ].filter(isFilled);

  return { contactLines, addressLines };
}
