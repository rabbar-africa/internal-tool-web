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
import type { PageKey } from "@/shared/constants/access";

export interface SideBarItem {
  name: string;
  icon: typeof DashboardIcon;
  href: string;
  slug: string;
  paths: string[];
  /**
   * The page it opens, from PAGE_ACCESS: hidden unless the user may open it,
   * so the sidebar and the route guard can't disagree. Leave it off only for
   * pages everyone has.
   */
  page?: PageKey;
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
        page: "customers",
      },
      {
        name: "Invoices",
        icon: FileTextIcon,
        href: RouteConstants.invoices.base.path,
        slug: "invoices",
        paths: [RouteConstants.invoices.base.path],
        page: "invoices",
      },
      {
        name: "Quotes",
        icon: FileTextIcon,
        href: RouteConstants.quotations.base.path,
        slug: "quotations",
        paths: [RouteConstants.quotations.base.path],
        page: "quotations",
      },
      {
        name: "Payments",
        icon: Money,
        href: RouteConstants.payments.base.path,
        slug: "payments",
        paths: [RouteConstants.payments.base.path],
        page: "payments",
      },
      {
        name: "Items & Services",
        icon: BriefCase,
        href: RouteConstants.items.base.path,
        slug: "items",
        paths: [RouteConstants.items.base.path],
        page: "items",
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
        page: "jobCards",
      },
      {
        name: "Inspections",
        icon: TaskIcon,
        href: RouteConstants.inspection.base.path,
        slug: "inspection",
        paths: [RouteConstants.inspection.base.path],
        page: "inspections",
      },
      {
        name: "Technicians",
        icon: UsersThree,
        href: RouteConstants.technicians.base.path,
        slug: "technicians",
        paths: [RouteConstants.technicians.base.path],
        page: "technicians",
      },
      {
        name: "Reminders",
        icon: BellSimpleRingingIcon,
        href: RouteConstants.reminders.base.path,
        slug: "reminders",
        paths: [RouteConstants.reminders.base.path],
        page: "reminders",
        planFeature: "reminders",
      },
      {
        name: "Paperwork",
        icon: ShieldCheckIcon,
        href: RouteConstants.paperwork.base.path,
        slug: "paperwork",
        paths: [RouteConstants.paperwork.base.path],
        page: "paperwork",
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
        page: "expenses",
      },
      {
        name: "Banking",
        icon: ArrowLeftRightIcon,
        href: RouteConstants.banking.base.path,
        slug: "banking",
        // Transfers and statements.
        paths: ["/banking"],
        page: "banking",
      },
      // Hidden until Reports shows real data (it renders mock data today).
      // {
      //   name: "Reports",
      //   icon: ChartBar,
      //   href: RouteConstants.reports.base.path,
      //   slug: "reports",
      //   paths: [RouteConstants.reports.base.path],
      //   page: "reports",
      // },
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
