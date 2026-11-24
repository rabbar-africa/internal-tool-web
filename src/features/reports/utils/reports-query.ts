/**
 * The Reports area shares one query string (docs/frontend-reports.md): the
 * home page's section and search, the period, the basis and every report's
 * filters. It travels with every move inside Reports (opening a report,
 * "All reports", a drill-down), so a period or filter chosen once holds in
 * every report that has it, and the sidebar is where it was on return. A
 * report reads only the keys it declares and ignores the rest.
 */

/** The home page's own keys: the sidebar section and the search. */
export const HOME_KEYS = { section: "section", search: "q" } as const;

/** `path` with the shared query, if there is any. */
export function withReportsQuery(
  path: string,
  search: URLSearchParams | string,
): string {
  const query = search.toString();
  return query ? `${path}?${query}` : path;
}
