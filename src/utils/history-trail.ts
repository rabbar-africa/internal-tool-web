import type { createBrowserRouter } from "react-router-dom";

/**
 * The app's own view of the browser history this tab has been through, so a
 * page can go back past entries it doesn't want (a deleted record's detail and
 * edit pages). The browser won't list its history, so the router's moves are
 * followed instead. After a reload only the current page is known.
 */

type Router = ReturnType<typeof createBrowserRouter>;
interface Entry {
  key: string;
  path: string;
}

const trail: Entry[] = [];
let at = -1;

function record(
  action: "PUSH" | "REPLACE" | "POP",
  location: { key: string; pathname: string; search: string },
) {
  const entry = {
    key: location.key,
    path: location.pathname + location.search,
  };
  if (action === "PUSH") {
    trail.splice(at + 1, trail.length, entry);
    at = trail.length - 1;
  } else if (action === "REPLACE" && at >= 0) {
    trail[at] = entry;
  } else {
    // Back or forward to an entry seen before; anything else starts afresh.
    const i = trail.findIndex((e) => e.key === entry.key);
    if (i >= 0) {
      at = i;
    } else {
      trail.splice(0, trail.length, entry);
      at = 0;
    }
  }
}

/** Called once, with the app's router. */
export function trackHistory(router: Router) {
  record("POP", router.state.location);
  router.subscribe((state) => {
    // Many state changes; only a new location counts.
    if (trail[at]?.key === state.location.key) return;
    record(state.historyAction, state.location);
  });
}

/**
 * How many steps back the nearest page not `skip`ped is, or null when none
 * is known (opened directly, or after a reload).
 */
export function stepsBackPast(skip: (path: string) => boolean): number | null {
  for (let i = at - 1; i >= 0; i--) {
    if (!skip(trail[i].path)) return at - i;
  }
  return null;
}
