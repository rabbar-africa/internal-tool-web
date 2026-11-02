import { RouteConstants } from "@/shared/constants/routes";
import { DashboardIcon } from "@/assets/custom/DashboardIcon";
import { TaskIcon } from "@/assets/custom/TasksIcon";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { Money } from "@/assets/custom/Money";
import { UsersIcon } from "@/assets/custom/UsersIcon";
import { UsersThree } from "@/assets/custom/UsersThree";
import { BriefCase } from "@/assets/custom/BriefCase";
import { ClipboardIcon } from "@/assets/custom/ClipboardIcon";
import { ClipboardTextIcon } from "@/assets/custom/ClipboardTextIcon";
import { ChartBar } from "@/assets/custom/ChartBar";
import { GearIcon } from "@/assets/custom/GearIcon";
import { ShieldCheckIcon } from "@/assets/custom/ShieldCheckIcon";
import { BellSimpleRingingIcon } from "@/assets/custom/BellSimpleRingingIcon";
import { ArrowLeftRightIcon } from "@/assets/custom/ArrowLeftRightIcon";
import type { PermissionInput } from "@/utils/permissions";

export interface SideBarItem {
  name: string;
  icon: typeof DashboardIcon;
  href: string;
  slug: string;
  paths: string[];
  /** Hidden unless the user holds it. */
  permission?: PermissionInput;
  /** Still shown without it, badged, so people see what upgrading gives them. */
  planFeature?: string;
}

/** Related pages under one heading, so the sidebar opens short. */
export interface SideBarGroup {
  name: string;
  icon: typeof DashboardIcon;
  items: SideBarItem[];
}

export const sideBarHome: SideBarItem = {
  name: "Dashboard",
  icon: DashboardIcon,
  href: RouteConstants.overview.base.path,
  slug: "dashboard",
  paths: [RouteConstants.overview.base.path],
};

export const sideBarGroups: SideBarGroup[] = [
  // Billing customers: the everyday loop, in the order it happens.
  {
    name: "Sales",
    icon: Money,
    items: [
      {
        name: "Customers",
        icon: UsersIcon,
        href: RouteConstants.customers.base.path,
        slug: "customers",
        paths: [RouteConstants.customers.base.path],
      },
      {
        name: "Invoices",
        icon: FileTextIcon,
        href: RouteConstants.invoices.base.path,
        slug: "invoices",
        paths: [RouteConstants.invoices.base.path],
      },
      {
        name: "Payments",
        icon: Money,
        href: RouteConstants.payments.base.path,
        slug: "payments",
        paths: [RouteConstants.payments.base.path],
      },
      {
        name: "Items & Services",
        icon: BriefCase,
        href: RouteConstants.items.base.path,
        slug: "items",
        paths: [RouteConstants.items.base.path],
      },
    ],
  },
  // Doing the work: cars in, people on them, what's coming due.
  {
    name: "Workshop",
    icon: ClipboardIcon,
    items: [
      {
        name: "Job Cards",
        icon: ClipboardIcon,
        href: RouteConstants.jobCards.base.path,
        slug: "job-cards",
        paths: [RouteConstants.jobCards.base.path],
      },
      {
        name: "Inspections",
        icon: TaskIcon,
        href: RouteConstants.inspection.base.path,
        slug: "inspection",
        paths: [RouteConstants.inspection.base.path],
      },
      {
        name: "Technicians",
        icon: UsersThree,
        href: RouteConstants.technicians.base.path,
        slug: "technicians",
        paths: [RouteConstants.technicians.base.path],
      },
      {
        name: "Reminders",
        icon: BellSimpleRingingIcon,
        href: RouteConstants.reminders.base.path,
        slug: "reminders",
        paths: [RouteConstants.reminders.base.path],
        planFeature: "reminders",
      },
      {
        name: "Paperwork",
        icon: ShieldCheckIcon,
        href: RouteConstants.paperwork.base.path,
        slug: "paperwork",
        paths: [RouteConstants.paperwork.base.path],
      },
    ],
  },
  // Where the money went, and how the business is doing.
  {
    name: "Finance",
    icon: ChartBar,
    items: [
      {
        name: "Expenses",
        icon: ClipboardTextIcon,
        href: RouteConstants.expenses.base.path,
        slug: "expenses",
        paths: [RouteConstants.expenses.base.path],
      },
      {
        name: "Banking",
        icon: ArrowLeftRightIcon,
        href: RouteConstants.banking.base.path,
        slug: "banking",
        // Transfers and statements.
        paths: ["/banking"],
        permission: "read:banking",
      },
      {
        name: "Reports",
        icon: ChartBar,
        href: RouteConstants.reports.base.path,
        slug: "reports",
        paths: [RouteConstants.reports.base.path],
      },
    ],
  },
];

/** Pinned to the bottom of the sidebar, out of the way of daily work. */
export const sideBarFooter: SideBarItem = {
  name: "Settings",
  icon: GearIcon,
  href: RouteConstants.settings.base.path,
  slug: "settings",
  paths: [RouteConstants.settings.base.path],
};
