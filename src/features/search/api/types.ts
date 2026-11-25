/** `GET /search` (docs/frontend-quick-search.md). */

export type SearchType =
  | "customers"
  | "invoices"
  | "jobCards"
  | "vehicles"
  | "items";

/** Every row has these; the rest are per type, for badges. */
export interface SearchResult {
  type: SearchType;
  id: string;
  title: string;
  subtitle: string | null;
  // customers
  phone?: string | null;
  status?: string | null;
  // invoices
  displayStatus?: string | null;
  date?: string | null;
  total?: number | null;
  balance?: number | null;
  plate?: string | null;
  // job cards
  openedAt?: string | null;
  vehicle?: string | null;
  // vehicles
  vin?: string | null;
  clientId?: string | null;
  ownerName?: string | null;
  // items
  rate?: number | null;
  unit?: string | null;
  productType?: "PRODUCT" | "SERVICE" | null;
  isGlobal?: boolean;
}

export interface SearchGroup {
  type: SearchType;
  /** More matched than were shown: offer "See all". */
  hasMore: boolean;
  results: SearchResult[];
}

export interface SearchResponse {
  query: string;
  /** What this person may read, so was looked in. */
  searched: SearchType[];
  /** In order; a group with no results is left out. */
  groups: SearchGroup[];
}
