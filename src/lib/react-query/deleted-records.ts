import type { Query, QueryClient } from "@tanstack/react-query";

/**
 * Records deleted in this session, by id. A delete mutation names what it
 * deletes (`meta.deletes`); from then on nothing asks the API for it again:
 * the refresh after the delete skips its queries (they would only 404), and
 * its cached copies are dropped once nothing shows them, so going forward to
 * its old page can't show it from the cache.
 *
 * Ids are UUIDs, so a query whose key holds one is about that record.
 */
const deleted = new Set<string>();

export const toIds = (
  value: string | readonly string[] | null | undefined,
): string[] =>
  value == null ? [] : typeof value === "string" ? [value] : [...value];

export function markDeleted(ids: readonly string[]) {
  ids.forEach((id) => id && deleted.add(id));
}

export const isDeleted = (id: string) => deleted.has(id);

const mentions = (query: Query, ids: ReadonlySet<string> | readonly string[]) =>
  query.queryKey.some(
    (part) =>
      typeof part === "string" &&
      ("has" in ids ? ids.has(part) : ids.includes(part)),
  );

/** For the refresh after a mutation: leave deleted records alone. */
export const isAboutDeletedRecord = (query: Query) => mentions(query, deleted);

/** Drops the cached copies of these records that nothing is showing. */
export function dropUnshown(client: QueryClient, ids: readonly string[]) {
  if (!ids.length) return;
  const cache = client.getQueryCache();
  cache
    .findAll({
      predicate: (q) => q.getObserversCount() === 0 && mentions(q, ids),
    })
    .forEach((q) => cache.remove(q));
}

/** Drops every cached copy of a record, once its page has closed. */
export function forgetRecord(client: QueryClient, id: string) {
  client.removeQueries({ predicate: (q) => mentions(q, [id]) });
}
