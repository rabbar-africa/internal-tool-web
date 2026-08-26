import { Badge, Box, Flex, Text } from "@chakra-ui/react";
import { type ColumnDef } from "@tanstack/react-table";
import moment from "moment";
import type { ITeamMember, IUserInvite } from "@/shared/interface/team";
import { formatRoleName, roleNamesOf } from "./roleHelpers";

const INVITE_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING: { bg: "orange.50", color: "orange.600" },
  ACCEPTED: { bg: "green.50", color: "green.600" },
  CANCELLED: { bg: "gray.100", color: "gray.400" },
};

function RoleBadges({ names }: { names: string[] }) {
  if (!names.length) {
    return (
      <Text textStyle="small-regular" color="gray.300">
        —
      </Text>
    );
  }
  return (
    <Flex gap="1" wrap="wrap">
      {names.map((name) => (
        <Badge key={name} size="sm" bg="primary.50" color="primary.400">
          {name}
        </Badge>
      ))}
    </Flex>
  );
}

export const memberColumns: ColumnDef<ITeamMember>[] = [
  {
    id: "name",
    header: "Name",
    cell: ({ row }) => {
      const member = row.original;
      const name = [member.firstName, member.lastName]
        .filter(Boolean)
        .join(" ");
      return (
        <Box>
          <Text textStyle="small-regular" color="gray.500" fontWeight="500">
            {name || "—"}
          </Text>
          <Text fontSize="11px" color="gray.300">
            {member.email}
          </Text>
        </Box>
      );
    },
  },
  {
    id: "roles",
    header: "Roles",
    cell: ({ row }) => (
      <RoleBadges names={roleNamesOf(row.original.userRoles)} />
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const member = row.original;
      if (!member.isActive) {
        return (
          <Badge size="sm" bg="gray.100" color="gray.400">
            Deactivated
          </Badge>
        );
      }
      if (!member.isEmailVerified) {
        return (
          <Badge size="sm" bg="orange.50" color="orange.600">
            Unverified
          </Badge>
        );
      }
      return (
        <Badge size="sm" bg="green.50" color="green.600">
          Active
        </Badge>
      );
    },
  },
  {
    id: "lastLoginAt",
    header: "Last active",
    cell: ({ row }) => (
      <Text textStyle="small-regular" color="gray.400">
        {row.original.lastLoginAt
          ? moment(row.original.lastLoginAt).format("DD MMM, YYYY")
          : "Never"}
      </Text>
    ),
  },
];

export const inviteColumns: ColumnDef<IUserInvite>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ getValue }) => (
      <Text textStyle="small-regular" color="gray.500" fontWeight="500">
        {getValue() as string}
      </Text>
    ),
  },
  {
    id: "roles",
    header: "Roles",
    cell: ({ row }) => (
      <RoleBadges
        names={(row.original.roles ?? []).map((role) =>
          formatRoleName(role.name),
        )}
      />
    ),
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const style =
        INVITE_STATUS_STYLE[row.original.status] ?? INVITE_STATUS_STYLE.PENDING;
      return (
        <Badge size="sm" bg={style.bg} color={style.color}>
          {formatRoleName(row.original.status)}
        </Badge>
      );
    },
  },
  {
    id: "expiresAt",
    header: "Expires",
    cell: ({ row }) => {
      const invite = row.original;
      if (invite.status !== "PENDING") {
        return (
          <Text textStyle="small-regular" color="gray.300">
            —
          </Text>
        );
      }
      const expired = moment(invite.expiresAt).isBefore(moment());
      return (
        <Text
          textStyle="small-regular"
          color={expired ? "error.300" : "gray.400"}
        >
          {expired ? "Expired" : moment(invite.expiresAt).fromNow()}
        </Text>
      );
    },
  },
];
