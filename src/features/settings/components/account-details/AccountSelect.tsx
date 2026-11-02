import { useMemo } from "react";
import { CustomSelect } from "@/components/input/CustomSelect";
import { useGetOrganizationBankAccounts } from "@/features/settings/api";
import type { IAccountRef, IOrgBankAccount } from "@/shared/interface/settings";

type AccountLike = Pick<
  IAccountRef,
  "accountName" | "accountNumber" | "bankName"
> & { type?: IAccountRef["type"] };

/** "Main — GTBank ••1234", or just the name for the Cash account. */
export function formatAccountLabel(account: AccountLike): string {
  if (account.type === "CASH") return account.accountName;
  const last4 = account.accountNumber?.slice(-4);
  return [
    account.accountName,
    [account.bankName, last4 ? `••${last4}` : ""].filter(Boolean).join(" "),
  ]
    .filter(Boolean)
    .join(" — ");
}

/** "Primary" on the primary; "Cash" on the till unless its name says so. */
function accountBadge(account: IOrgBankAccount): string | undefined {
  if (account.type === "CASH") {
    return account.accountName.trim().toLowerCase() === "cash"
      ? undefined
      : "Cash";
  }
  return account.isPrimary ? "Primary" : undefined;
}

/**
 * The org's accounts as select options, each once. Without `includeCash` the
 * till is left out — invoices must name a real bank account.
 */
export function useAccountOptions({ includeCash = false } = {}) {
  const { data, isLoading } = useGetOrganizationBankAccounts({ includeCash });
  const accounts = useMemo(
    () =>
      (data?.data ?? []).filter(
        (account) => includeCash || account.type !== "CASH",
      ),
    [data?.data, includeCash],
  );
  const options = useMemo(
    () =>
      accounts.map((account) => ({
        label: formatAccountLabel(account),
        value: account.id,
        badge: accountBadge(account),
      })),
    [accounts],
  );
  return { accounts, options, isLoading };
}

/**
 * The account the server picks when none is sent, in the backend's
 * `resolveBankAccountId` order: Cash for cash, then `fallbackAccountId`, then
 * the primary bank account.
 */
function defaultAccountOf(
  accounts: IOrgBankAccount[],
  { isCash = false, fallbackAccountId = null as string | null | undefined },
) {
  return (
    (isCash ? accounts.find((a) => a.type === "CASH") : undefined) ??
    (fallbackAccountId
      ? accounts.find((a) => a.id === fallbackAccountId)
      : undefined) ??
    accounts.find((a) => a.isPrimary && a.type !== "CASH")
  );
}

interface AccountSelectProps {
  label: string;
  /** Chosen account id; "" shows (and leaves the server to apply) the default. */
  value: string;
  onChange: (id: string) => void;
  /** Payments and expenses can go through the till; invoices cannot. */
  includeCash?: boolean;
  /** The money moved as cash, so by default it is in (or left) the till. */
  isCash?: boolean;
  /** Tried before the primary for non-cash money, e.g. the invoice's account. */
  fallbackAccountId?: string | null;
  helperText?: string;
  error?: string;
}

/**
 * Picks the org account money went through. Each account appears once; while
 * `value` is "" the default account is shown selected, and the form sends
 * nothing so the server applies that same default.
 */
export function AccountSelect({
  label,
  value,
  onChange,
  includeCash = false,
  isCash = false,
  fallbackAccountId,
  helperText,
  error,
}: AccountSelectProps) {
  const { accounts, options, isLoading } = useAccountOptions({ includeCash });

  const defaultAccount = useMemo(
    () =>
      defaultAccountOf(accounts, {
        isCash: includeCash && isCash,
        fallbackAccountId,
      }),
    [accounts, includeCash, isCash, fallbackAccountId],
  );

  const selected = value || defaultAccount?.id;

  return (
    <CustomSelect
      label={label}
      placeholder="Select account..."
      noOptionsText="No accounts yet"
      options={options}
      loading={isLoading}
      value={selected ? [selected] : undefined}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0];
        if (next) onChange(next);
      }}
      helperText={helperText}
      error={error}
    />
  );
}

const ALL_ACCOUNTS = "__all__";

/** List filter by account; "" means every account. Cash included. */
export function AccountFilterSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (id: string) => void;
}) {
  const { options, isLoading } = useAccountOptions({ includeCash: true });
  return (
    <CustomSelect
      options={[{ label: "All Accounts", value: ALL_ACCOUNTS }, ...options]}
      loading={isLoading}
      value={[value || ALL_ACCOUNTS]}
      onChange={(opt: { value: string[] }) => {
        const next = opt?.value?.[0] ?? ALL_ACCOUNTS;
        onChange(next === ALL_ACCOUNTS ? "" : next);
      }}
      rootProps={{ size: "sm", w: { base: "100%", md: "auto" } }}
      controlProps={{ w: { base: "100%", md: "200px" } }}
    />
  );
}

/**
 * What to send for an account field on save. Create: the id, or nothing when
 * the default was left alone. Edit: nothing when unchanged, `null` when the
 * form went back to following the default (e.g. after a cash ↔ non-cash mode
 * change), so the server re-picks it.
 */
export function accountFieldForSave(
  value: string,
  edit?: { original: string | null | undefined },
): string | null | undefined {
  if (!edit) return value || undefined;
  if (value === (edit.original ?? "")) return undefined;
  return value || null;
}
