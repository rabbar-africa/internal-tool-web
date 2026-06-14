import { RouteConstants } from "@/shared/constants/routes";
import { DashboardIcon } from "@/assets/custom/DashboardIcon";
import { TaskIcon } from "@/assets/custom/TasksIcon";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { Money } from "@/assets/custom/Money";
import { UsersIcon } from "@/assets/custom/UsersIcon";
import { BriefCase } from "@/assets/custom/BriefCase";
import { ClipboardTextIcon } from "@/assets/custom/ClipboardTextIcon";
import { ChartBar } from "@/assets/custom/ChartBar";
import { GearIcon } from "@/assets/custom/GearIcon";

export const sideBarItems = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    href: RouteConstants.overview.base.path,
    slug: "dashboard",
    paths: [RouteConstants.overview.base.path],
  },
  {
    name: "Inspection",
    icon: TaskIcon,
    href: RouteConstants.inspection.base.path,
    slug: "inspection",
    paths: [RouteConstants.inspection.base.path],
  },
  {
    name: "Invoices",
    icon: FileTextIcon,
    href: RouteConstants.invoices.base.path,
    slug: "invoices",
    paths: [RouteConstants.invoices.base.path],
  },
  {
    name: "Payments Received",
    icon: Money,
    href: RouteConstants.payments.base.path,
    slug: "payments",
    paths: [RouteConstants.payments.base.path],
  },
  {
    name: "Customers",
    icon: UsersIcon,
    href: RouteConstants.customers.base.path,
    slug: "customers",
    paths: [RouteConstants.customers.base.path],
  },
  {
    name: "Items / Services",
    icon: BriefCase,
    href: RouteConstants.items.base.path,
    slug: "items",
    paths: [RouteConstants.items.base.path],
  },
  {
    name: "Expense Tracking",
    icon: ClipboardTextIcon,
    href: RouteConstants.expenses.base.path,
    slug: "expenses",
    paths: [RouteConstants.expenses.base.path],
  },
  {
    name: "Reports",
    icon: ChartBar,
    href: RouteConstants.reports.base.path,
    slug: "reports",
    paths: [RouteConstants.reports.base.path],
  },
  {
    name: "Settings",
    icon: GearIcon,
    href: RouteConstants.settings.base.path,
    slug: "settings",
    paths: [RouteConstants.settings.base.path],
  },
];
