import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Box, Flex, Input, Spinner, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { ClipboardTextIcon } from "@/assets/custom/ClipboardTextIcon";
import { FileTextIcon } from "@/assets/custom/FileTextIcon";
import { MagnifyingGlassIcon } from "@/assets/custom/MagnifyingGlassIcon";
import { PoliceCarIcon } from "@/assets/custom/PoliceCarIcon";
import { TagIcon } from "@/assets/custom/TagIcon";
import { User } from "@/assets/custom/User";
import { XIcon } from "@/assets/custom/XIcon";
import { JobCardStatusBadge } from "@/features/job-cards/components/job-card-list/columns";
import { useFormatMoney } from "@/hooks/useFormatMoney";
import { RouteConstants } from "@/shared/constants/routes";
import { getStatusColor } from "@/utils/get-color";
import type { JobCardStatus } from "@/shared/interface/job-card";
import { MIN_QUERY_LENGTH, useQuickSearchQuery } from "../api/query";
import type { SearchResult, SearchType } from "../api/types";

/** Waits this long after the last keystroke before searching. */
const DEBOUNCE_MS = 200;

const GROUP: Record<
  SearchType,
  { label: string; plural: string; icon: typeof User; list: string }
> = {
  customers: {
    label: "Customers",
    plural: "customers",
    icon: User,
    list: RouteConstants.customers.base.path,
  },
  invoices: {
    label: "Invoices",
    plural: "invoices",
    icon: FileTextIcon,
    list: RouteConstants.invoices.base.path,
  },
  jobCards: {
    label: "Job cards",
    plural: "job cards",
    icon: ClipboardTextIcon,
    list: RouteConstants.jobCards.base.path,
  },
  // The customer list's search finds vehicles too (plate, make, model).
  vehicles: {
    label: "Vehicles",
    plural: "vehicles",
    icon: PoliceCarIcon,
    list: RouteConstants.customers.base.path,
  },
  items: {
    label: "Products & services",
    plural: "products and services",
    icon: TagIcon,
    list: RouteConstants.items.base.path,
  },
};

const withSearch = (path: string, q: string) =>
  `${path}?search=${encodeURIComponent(q)}`;

/** Where a result opens. Vehicles and products have no page of their own. */
function pathFor(result: SearchResult): string {
  switch (result.type) {
    case "customers":
      return RouteConstants.customers.detail.generate({ id: result.id });
    case "invoices":
      return RouteConstants.invoices.detail.generate({ id: result.id });
    case "jobCards":
      return RouteConstants.jobCards.detail.generate({ id: result.id });
    case "vehicles":
      return result.clientId
        ? RouteConstants.customers.detail.generate({ id: result.clientId })
        : withSearch(RouteConstants.customers.base.path, result.title);
    case "items":
      return withSearch(RouteConstants.items.base.path, result.title);
  }
}

/** "PARTIALLY_PAID" → "Partially paid". */
const humanize = (value: string) =>
  value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");

/** One thing the arrow keys can land on: a result, or a "See all" link. */
type Entry =
  | { kind: "result"; key: string; result: SearchResult }
  | { kind: "more"; key: string; type: SearchType };

/**
 * The search box in the top bar. Finds customers, invoices, job cards,
 * vehicles and products in one call, grouped, as you type; ↑ ↓ and Enter to
 * open one, ⌘K / Ctrl+K to jump here from anywhere.
 */
export function QuickSearch() {
  const navigate = useNavigate();
  const { formatMoney } = useFormatMoney();
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const [text, setText] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  // Debounce what was typed into what is searched.
  useEffect(() => {
    const timer = window.setTimeout(() => setQuery(text.trim()), DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [text]);

  const searchable = query.length >= MIN_QUERY_LENGTH;
  const { data, isFetching, isError } = useQuickSearchQuery(query);
  const groups = useMemo(
    () => (searchable && data ? data.groups : []),
    [searchable, data],
  );

  const entries = useMemo<Entry[]>(
    () =>
      groups.flatMap((group) => [
        ...group.results.map((result) => ({
          kind: "result" as const,
          key: `${result.type}-${result.id}`,
          result,
        })),
        ...(group.hasMore
          ? [
              {
                kind: "more" as const,
                key: `more-${group.type}`,
                type: group.type,
              },
            ]
          : []),
      ]),
    [groups],
  );

  // New results: start again at the top.
  useEffect(() => setActive(0), [entries]);

  // ⌘K / Ctrl+K from anywhere.
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // A click anywhere else closes it.
  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open]);

  const go = (entry: Entry) => {
    navigate(
      entry.kind === "result"
        ? pathFor(entry.result)
        : withSearch(GROUP[entry.type].list, query),
    );
    setOpen(false);
    setText("");
    setQuery("");
    inputRef.current?.blur();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (text) setText("");
      else inputRef.current?.blur();
      setOpen(false);
      return;
    }
    if (!entries.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((index) => (index + 1) % entries.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((index) => (index - 1 + entries.length) % entries.length);
    } else if (event.key === "Enter" && entries[active]) {
      event.preventDefault();
      go(entries[active]);
    }
  };

  // Scroll the highlighted row into view as the arrows move.
  useEffect(() => {
    rootRef.current
      ?.querySelector(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const showPanel = open && text.trim().length >= MIN_QUERY_LENGTH;
  const waiting = !data || (isFetching && data.query !== query);
  const isMac =
    typeof navigator !== "undefined" &&
    /Mac|iPhone|iPad/.test(navigator.platform);

  let index = -1;
  const indexOf = () => ++index;

  return (
    <Box ref={rootRef} position="relative" flex="1" maxW="26rem" minW="0">
      <Flex
        align="center"
        gap="2"
        h="2.5rem"
        px="3"
        bg="white"
        borderWidth="1px"
        borderColor={open ? "primary.300" : "gray.75"}
        rounded="xl"
        boxShadow={open ? "0 0 0 3px rgba(1, 48, 100, 0.12)" : "none"}
        transition="border-color .15s ease, box-shadow .15s ease"
        cursor="text"
        onClick={() => inputRef.current?.focus()}
      >
        <MagnifyingGlassIcon boxSize="1.1rem" color="gray.300" flexShrink={0} />
        <Input
          ref={inputRef}
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="Search customers, invoices, plates…"
          aria-label="Search"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="quick-search-results"
          aria-autocomplete="list"
          autoComplete="off"
          spellCheck={false}
          border="none"
          outline="none"
          bg="transparent"
          h="100%"
          px="0"
          // 16px stops iOS zooming into the field; smaller from tablets up.
          fontSize={{ base: "16px", md: "14px" }}
          color="gray.500"
          _placeholder={{ color: "gray.300" }}
          _focusVisible={{ outline: "none", boxShadow: "none" }}
        />
        {text ? (
          <Box
            as="button"
            aria-label="Clear search"
            display="inline-flex"
            color="gray.300"
            _hover={{ color: "gray.500" }}
            onClick={(event) => {
              event.stopPropagation();
              setText("");
              setQuery("");
              inputRef.current?.focus();
            }}
          >
            <XIcon boxSize="0.9rem" />
          </Box>
        ) : (
          <Text
            as="kbd"
            display={{ base: "none", md: "inline-flex" }}
            fontSize="11px"
            fontFamily="inherit"
            color="gray.300"
            borderWidth="1px"
            borderColor="gray.75"
            rounded="md"
            px="1.5"
            py="0.5"
            flexShrink={0}
          >
            {isMac ? "⌘K" : "Ctrl K"}
          </Text>
        )}
      </Flex>

      {showPanel && (
        <Box
          id="quick-search-results"
          role="listbox"
          position={{ base: "fixed", md: "absolute" }}
          top={{ base: "64px", md: "calc(100% + 8px)" }}
          left={{ base: "3", md: "0" }}
          right={{ base: "3", md: "auto" }}
          w={{ base: "auto", md: "34rem" }}
          maxH="min(70vh, 34rem)"
          overflowY="auto"
          bg="white"
          rounded="xl"
          borderWidth="1px"
          borderColor="gray.75"
          boxShadow="0 12px 32px rgba(0, 31, 62, 0.12)"
          zIndex="popover"
          py="2"
        >
          {isError ? (
            <Message
              title="Search isn't working right now"
              hint="Try again in a moment."
            />
          ) : waiting && !groups.length ? (
            <Flex
              align="center"
              justify="center"
              gap="2"
              py="6"
              color="gray.300"
            >
              <Spinner size="sm" />
              <Text fontSize="13px">Searching…</Text>
            </Flex>
          ) : !groups.length ? (
            <Message
              title={`No results for “${query}”`}
              hint="Try an invoice number like INV-0042, a customer's name, a plate number or a product."
            />
          ) : (
            groups.map((group, groupIndex) => {
              const meta = GROUP[group.type];
              return (
                <Box
                  key={group.type}
                  borderTopWidth={groupIndex ? "1px" : "0"}
                  borderColor="gray.75"
                  pt={groupIndex ? "2" : "0"}
                  mt={groupIndex ? "2" : "0"}
                >
                  <Text
                    px="4"
                    pt="1.5"
                    pb="1"
                    fontSize="11px"
                    fontWeight="600"
                    letterSpacing="0.06em"
                    textTransform="uppercase"
                    color="gray.300"
                  >
                    {meta.label}
                  </Text>
                  {group.results.map((result) => {
                    const i = indexOf();
                    return (
                      <Row
                        key={`${result.type}-${result.id}`}
                        index={i}
                        active={i === active}
                        onHover={() => setActive(i)}
                        onSelect={() =>
                          go({ kind: "result", key: result.id, result })
                        }
                        icon={<meta.icon boxSize="1.05rem" />}
                        title={result.title}
                        subtitle={subtitleFor(result)}
                        trailing={trailingFor(result, formatMoney)}
                      />
                    );
                  })}
                  {group.hasMore &&
                    (() => {
                      const i = indexOf();
                      return (
                        <Flex
                          as="button"
                          data-index={i}
                          role="option"
                          aria-selected={i === active}
                          w="full"
                          align="center"
                          justify="space-between"
                          px="4"
                          py="2.5"
                          mt="1"
                          bg={i === active ? "gray.50" : "transparent"}
                          onMouseEnter={() => setActive(i)}
                          onClick={() =>
                            go({
                              kind: "more",
                              key: group.type,
                              type: group.type,
                            })
                          }
                          cursor="pointer"
                        >
                          <Text
                            fontSize="13px"
                            color="gray.400"
                            textAlign="left"
                          >
                            See all {meta.plural} matching{" "}
                            <Text as="span" fontWeight="700" color="gray.500">
                              “{query}”
                            </Text>
                          </Text>
                          <Text color="gray.300" aria-hidden>
                            →
                          </Text>
                        </Flex>
                      );
                    })()}
                </Box>
              );
            })
          )}
        </Box>
      )}
    </Box>
  );
}

/** The grey line under a result's title. */
function subtitleFor(result: SearchResult): string | null {
  if (result.type === "jobCards") {
    return (
      [result.subtitle, result.vehicle].filter(Boolean).join(" · ") || null
    );
  }
  return result.subtitle;
}

/** Badges on the right of a row, per type. */
function trailingFor(
  result: SearchResult,
  formatMoney: (
    amount: number | null | undefined,
    options?: { fractionDigits?: number },
  ) => string,
): ReactNode {
  // Kobo only when there is some: "₦120,400", "₦120.40".
  const money = (amount: number) =>
    formatMoney(amount, {
      fractionDigits: Number.isInteger(amount) ? 0 : 2,
    });
  switch (result.type) {
    case "invoices": {
      const status = result.displayStatus ?? result.status;
      return (
        <>
          {status && <StatusPill status={status} />}
          {result.total != null && (
            <Text
              fontSize="14px"
              fontWeight="700"
              color="gray.500"
              whiteSpace="nowrap"
            >
              {money(result.total)}
            </Text>
          )}
        </>
      );
    }
    case "jobCards":
      return result.status ? (
        <JobCardStatusBadge status={result.status as JobCardStatus} />
      ) : null;
    case "vehicles":
      return result.ownerName ? (
        <Text fontSize="12px" color="gray.300" whiteSpace="nowrap">
          {result.ownerName}
        </Text>
      ) : null;
    case "items":
      return (
        <>
          {result.productType && (
            <Text fontSize="12px" color="gray.300">
              {result.productType === "SERVICE" ? "Service" : "Product"}
            </Text>
          )}
          {result.rate != null && (
            <Text
              fontSize="14px"
              fontWeight="700"
              color="gray.500"
              whiteSpace="nowrap"
            >
              {money(result.rate)}
            </Text>
          )}
        </>
      );
    default:
      return null;
  }
}

/** "● Paid": the list's colours for the status, as a soft pill. */
function StatusPill({ status }: { status: string }) {
  const colors = getStatusColor(status) ?? { bg: "gray.50", text: "gray.400" };
  return (
    <Flex
      align="center"
      gap="1.5"
      px="2.5"
      py="1"
      rounded="full"
      bg={colors.bg}
      color={colors.text}
      flexShrink={0}
    >
      <Box boxSize="6px" rounded="full" bg="currentColor" />
      <Text fontSize="12px" fontWeight="500" whiteSpace="nowrap">
        {humanize(status)}
      </Text>
    </Flex>
  );
}

function Row({
  index,
  active,
  onHover,
  onSelect,
  icon,
  title,
  subtitle,
  trailing,
}: {
  index: number;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
  icon: ReactNode;
  title: string;
  subtitle: string | null;
  trailing: ReactNode;
}) {
  return (
    <Flex
      as="button"
      data-index={index}
      role="option"
      aria-selected={active}
      w="full"
      align="center"
      gap="3"
      px="4"
      py="2"
      textAlign="left"
      bg={active ? "gray.50" : "transparent"}
      onMouseEnter={onHover}
      // Before the input's blur, so the click isn't lost.
      onMouseDown={(event) => event.preventDefault()}
      onClick={onSelect}
      cursor="pointer"
    >
      <Flex
        align="center"
        justify="center"
        boxSize="2.25rem"
        rounded="lg"
        bg="gray.50"
        borderWidth="1px"
        borderColor="gray.75"
        color="gray.400"
        flexShrink={0}
      >
        {icon}
      </Flex>
      <Box flex="1" minW="0">
        <Text fontSize="14px" fontWeight="500" color="gray.500" truncate>
          {title}
        </Text>
        {subtitle && (
          <Text fontSize="12px" color="gray.300" truncate>
            {subtitle}
          </Text>
        )}
      </Box>
      {trailing && (
        <Flex align="center" gap="3" flexShrink={0}>
          {trailing}
        </Flex>
      )}
    </Flex>
  );
}

function Message({ title, hint }: { title: string; hint: string }) {
  return (
    <Box textAlign="center" px="6" py="5">
      <Text fontSize="14px" fontWeight="600" color="gray.500">
        {title}
      </Text>
      <Text fontSize="12px" color="gray.300" mt="1">
        {hint}
      </Text>
    </Box>
  );
}
