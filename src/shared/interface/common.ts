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
  email: string;
  logo: string;
  industry: string;
  website: string;
  userId: string;
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
