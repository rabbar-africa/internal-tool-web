import { RouteConstants } from "@/shared/constants/routes";
// import { BuildingIcon } from '@/assets/custom/BuildingIcon';
import { DashboardIcon } from "@/assets/custom/DashboardIcon";
import { GearIcon } from "@/assets/custom/GearIcon";
// import { LightBulbIcon } from '@/assets/custom/LightBulbIcon';
// import { RobotIcon } from '@/assets/custom/RobotIcon';
// import { ShieldCheckIcon } from '@/assets/custom/ShieldCheckIcon';
// import { SparkleIcon } from '@/assets/custom/SparkleIcon';
import { TaskIcon } from "@/assets/custom/TasksIcon";
// import { UserFocusIcon } from '@/assets/custom/UserFocusIcon';
import { UsersIcon } from "@/assets/custom/UsersIcon";
// import { CopyIcon } from '@/assets/custom/CopyIcon';
import { ClipboardIcon } from "@/assets/custom/ClipboardIcon";
// import { FileTextIcon } from '@/assets/custom/FileTextIcon';
// import { SignOutIcon } from '@/assets/custom/SignOutIcon';
import { Money } from "@/assets/custom/Money";
// import { DatabaseIcon } from '@/assets/custom/DatabaseIcon';
// import { BellSimpleRingingIcon } from '@/assets/custom/BellSimpleRingingIcon';
import { ChartBar } from "@/assets/custom/ChartBar";
import { HeadSet } from "@/assets/custom/HeadSet";
import { MonitorIcon } from "@/assets/custom/MonitorIcon";
import {
  BellSimpleRingingIcon,
  RobotIcon,
  ShieldCheckIcon,
} from "@/assets/custom";

export const sideBarItems = [
  {
    name: "Dashboard",
    icon: DashboardIcon,
    href: RouteConstants.overview.base.path,
    slug: "dashboard",
    paths: [RouteConstants.overview.base.path],
  },
  {
    name: "Merchant",
    icon: TaskIcon,
    href: RouteConstants.merchant.base.path,
    slug: "merchant",
    paths: [RouteConstants.merchant.base.path],
  },
  {
    name: "User",
    icon: UsersIcon,
    href: RouteConstants.user.base.path,
    slug: "user",
    paths: [RouteConstants.user.base.path],
  },
  {
    name: "Transaction Ledger",
    icon: ClipboardIcon,
    href: RouteConstants.transactionLedger.base.path,
    slug: "transaction-ledger",
    paths: [RouteConstants.transactionLedger.base.path],
  },
  {
    name: "Wallet & Funds",
    icon: Money,
    href: RouteConstants.wallet.base.path,
    slug: "wallet",
    paths: [RouteConstants.wallet.base.path],
  },
  {
    name: "System Configuration",
    icon: GearIcon,
    href: RouteConstants.systemConfiguration.base.path,
    slug: "system-configuration",
    paths: [
      RouteConstants.systemConfiguration.base.path,
      RouteConstants.systemConfiguration.rolesAndPermissions.path,
    ],
  },
  {
    name: "Security & Compliance",
    icon: ShieldCheckIcon,
    href: RouteConstants.securityAndCompliance.base.path,
    slug: "security-and-compliance",
    paths: [
      RouteConstants.securityAndCompliance.base.path,
      RouteConstants.securityAndCompliance.auditLogs.path,
    ],
  },
  {
    name: "API & Integrations",
    icon: RobotIcon,
    href: RouteConstants.apiAndIntegrations.base.path,
    slug: "api-and-integrations",
    paths: [
      RouteConstants.apiAndIntegrations.base.path,
      RouteConstants.apiAndIntegrations.apiKeys.path,
    ],
  },
  {
    name: "Notifications & Alerts",
    icon: BellSimpleRingingIcon,
    href: RouteConstants.notifications.base.path,
    slug: "notifications",
    paths: [
      RouteConstants.notifications.base.path,
      RouteConstants.notifications.emailTemplates.path,
    ],
  },

  // {
  //   name: 'System Configuration',
  //   icon: GearIcon,
  //   href: RouteConstants.systemConfiguration.base.path,
  //   slug: 'system-configuration',
  //   paths: [
  //     RouteConstants.systemConfiguration.base.path,
  //     RouteConstants.systemConfiguration.rolesAndPermissions.path,
  //   ],
  // },
  // {
  //   name: 'Security & Compliance',
  //   icon: ShieldCheckIcon,
  //   href: RouteConstants.securityAndCompliance.base.path,
  //   slug: 'security-and-compliance',
  //   paths: [
  //     RouteConstants.securityAndCompliance.base.path,
  //     RouteConstants.securityAndCompliance.auditLogs.path,
  //   ],
  // },
  // {
  //   name: 'API & Integrations',
  //   icon: RobotIcon,
  //   href: RouteConstants.apiAndIntegrations.base.path,
  //   slug: 'api-and-integrations',
  //   paths: [
  //     RouteConstants.apiAndIntegrations.base.path,
  //     RouteConstants.apiAndIntegrations.apiKeys.path,
  //   ],
  // },

  {
    name: "Reports & Analytics",
    icon: ChartBar,
    href: RouteConstants.reports.base.path,
    slug: "reports",
    paths: [
      RouteConstants.reports.base.path,
      RouteConstants.reports.transactionReports.path,
    ],
  },
  {
    name: "Support System",
    icon: HeadSet,
    href: RouteConstants.support.base.path,
    slug: "support",
    paths: [
      RouteConstants.support.base.path,
      RouteConstants.support.tickets.path,
    ],
  },
  {
    name: "System Logs",
    icon: MonitorIcon,
    href: RouteConstants.systemLogs.base.path,
    slug: "system-logs",
    paths: [RouteConstants.systemLogs.base.path],
  },
  {
    name: "Admin Settings",
    icon: GearIcon,
    href: RouteConstants.settings.base.path,
    slug: "settings",
    paths: [
      RouteConstants.settings.base.path,
      RouteConstants.settings.profileSettings.path,
      RouteConstants.settings.accountSettings.path,
      RouteConstants.settings.teamManagement.path,
    ],
  },
];
