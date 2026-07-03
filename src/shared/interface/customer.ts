export type CustomerType = "individual" | "company";
export type CustomerStatus = "active" | "inactive";

export interface ICustomer {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  company: string;
  phone: string;
  stage: string;
  displayName: string;
  email: string;
  jobTitle: string | null;
  type: string | null;
  consultedBy: string | null;
  source: string | null;
  affiliate: string | null;
  lastConsultationDate: string | null;
  referralSource: string | null;
  utmSource: string | null;
  utmCampaign: string | null;
  utmMedium: string | null;
  utmContent: string | null;
  organizationId: string;
  country: string | null;
  state: string | null;
  city: string | null;
  dob: string | null;
  postalCode: string | null;
  address: string | null;
  updatedAt: string;
  createdAt: string;
  emailMarketingConsent: boolean;
  status: CustomerStatus;
  followUpDate: string | null;
  followUpDays: string | null;
  followUpDue: boolean;
  followUpInDays: string | null;
  followUpNote: string | null;
  followUpSetAt: string | null;
}

export interface CreateCustomerPayload {
  email: string;
  phone: string;
  type: string;
  address?: string;
  city?: string;
  state?: string;
  country: string;
  displayName: string;
  firstName: string;
  lastName: string;
  stage: string;

  notes?: string;
}
