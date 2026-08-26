import { Box, Grid, Stack, Text } from "@chakra-ui/react";
import { RouteConstants } from "@/shared/constants/routes";
import { BuildingIcon } from "@/assets/custom/BuildingIcon";
import { SparkleIcon } from "@/assets/custom/SparkleIcon";
import { MapPinLineIcon } from "@/assets/custom/MapPinLineIcon";
import { Money } from "@/assets/custom/Money";
import { BooksIcon } from "@/assets/custom/BooksIcon";
import { ScalesIcon } from "@/assets/custom/ScalesIcon";
import { ListBullets } from "@/assets/custom/ListBullets";
import { GearIcon } from "@/assets/custom/GearIcon";
import { UserCirclePlus } from "@/assets/custom/UserCirclePlus";
import { ShieldCheckIcon } from "@/assets/custom/ShieldCheckIcon";
import { usePermissions } from "@/hooks/usePermissions";
import { SettingsCard, type SettingsCardItem } from "./SettingsCard";

const { settings } = RouteConstants;

interface SettingsGroup {
  title: string;
  items: SettingsCardItem[];
}

const SETTINGS_GROUPS: SettingsGroup[] = [
  {
    title: "Organization settings",
    items: [
      {
        title: "General Configuration",
        description:
          "Formatting, finance defaults, branding, and inspection preferences.",
        icon: GearIcon,
        href: settings.generalConfig.path,
      },
      {
        title: "Company Profile",
        description: "Business name, contact details, and registration info.",
        icon: BuildingIcon,
        href: settings.profile.path,
      },
      {
        title: "Logo & Branding",
        description: "Upload the logo shown on invoices and documents.",
        icon: SparkleIcon,
        href: settings.logo.path,
      },
      {
        title: "Addresses",
        description:
          "Manage billing, shipping, and office addresses; set a primary.",
        icon: MapPinLineIcon,
        href: settings.addresses.path,
      },
    ],
  },
  {
    title: "Finance settings",
    items: [
      {
        title: "Currencies",
        description:
          "Configure supported currencies, exchange rates, and the default.",
        icon: Money,
        href: settings.currency.path,
      },
      {
        title: "Account Details",
        description: "Bank accounts shown on invoices and used for payments.",
        icon: BooksIcon,
        href: settings.accountDetails.path,
      },
      {
        title: "Taxes",
        description: "Set up VAT, withholding, and other tax rates.",
        icon: ScalesIcon,
        href: settings.taxes.path,
      },
    ],
  },
  {
    title: "People & access",
    items: [
      {
        title: "Team Management",
        description:
          "Invite people, manage members, and control who is still active.",
        icon: UserCirclePlus,
        href: settings.teamManagement.path,
        anyOf: ["read:users"],
      },
      {
        title: "Roles & Permissions",
        description:
          "Create roles and choose exactly what each one is allowed to do.",
        icon: ShieldCheckIcon,
        href: settings.roles.path,
        anyOf: ["read:roles"],
      },
    ],
  },
  {
    title: "Transaction settings",
    items: [
      {
        title: "Transaction Series",
        description:
          "Numbering for invoices, receipts, payments, and other modules.",
        icon: ListBullets,
        href: settings.transactionSeries.path,
      },
    ],
  },
];

export function SettingsPage() {
  const { hasAny } = usePermissions();

  // A card the user can't act on is noise — and the route would bounce them
  // straight back anyway.
  const groups = SETTINGS_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => !item.anyOf || hasAny(item.anyOf)),
  })).filter((group) => group.items.length > 0);

  return (
    <Stack gap="8">
      <Box>
        <Text textStyle="h3-bold" color="gray.500">
          Settings
        </Text>
        <Text textStyle="small-regular" color="gray.300" mt="1">
          Configure your organization's preferences
        </Text>
      </Box>

      {groups.map((group) => (
        <Box key={group.title}>
          <Text fontSize="13px" fontWeight="700" color="gray.400" mb="3">
            {group.title}
          </Text>
          <Grid
            templateColumns={{
              base: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            columnGap="6"
            rowGap="2"
          >
            {group.items.map((item) => (
              <SettingsCard key={item.title} {...item} />
            ))}
          </Grid>
        </Box>
      ))}
    </Stack>
  );
}
