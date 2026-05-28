import type { ButtonProps } from "@chakra-ui/react";
import type { ComponentType } from "react";

export interface TabContentProps {
  value: string;
  component: ComponentType;
  activeTab: string | null;
}

export interface ActionButtonProps {
  icon: ComponentType<any>;
  text: string;
  variant?: ButtonProps["variant"];
  onClick?: () => void;
}

export interface SectionConfig {
  value: string;
  label: string;
  cta?: string;
  onClickCta?: () => void;
  loading?: boolean;
  component: ComponentType;
  ctaIcon?: ComponentType<any>;
  icon?: ComponentType<any>;
}

export interface SidebarItemProps {
  name: string;
  icon: any;
  href: string;
  slug?: string;
  paths?: string[];
}

export type TRiskLevel = "Low" | "Medium" | "High" | "Critical";
export type TRopaStatus =
  | "Draft"
  | "ReviewDue"
  | "PendingApproval"
  | "Active"
  | "Completed"
  | "UnderReview"
  | "Archived";

export interface IOrganization {
  id: string;
  name: string;
  slug: string;
  email: string;
  companyEmail: string;
  phone: string;
  phone2: string | null;
  fax: string | null;
  website: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string | null;
  country: string;
  postalCode: string | null;
  logoUrl: string;
  taxId: string | null;
  rcNumber: string;
  industry: string;
  description: string | null;
  registrationNumber: string | null;
  timezone: string;
  currency: string;
  invoicePrefix: string;
  autoGenerateInvoiceNumber: boolean;
  invoiceSequence: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface IGeneralMetaOptions {
  id: string;
  title: string;
  name: string;
  description?: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  score?: number;
}

export interface IBusiness {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
  swifin_id: string;
  hanypay_id: string;
  address: string;
  description: string;
  created_by: string;
  is_email_verified: boolean;
}

export interface IVehicle {
  id: string;
  registrationNumber: string;
  make: string;
  model: string;
  year?: string;
  color?: string;
}
