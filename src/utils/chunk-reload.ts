const RELOAD_KEY = "chunk-reload-at";

// If a reload already happened this recently, the chunk is genuinely missing
// rather than stale, and reloading again would just spin.
const RELOAD_COOLDOWN_MS = 10_000;

/**
 * Vite emits hashed chunk filenames, so a redeploy replaces the files the
 * currently-open tab expects. The next lazy route it tries to load 404s. Each
 * browser words that failure differently.
 */
export function isChunkLoadError(error: unknown): boolean {
  const message = (
    error instanceof Error ? error.message : String(error ?? "")
  ).toLowerCase();

  return (
    message.includes("failed to fetch dynamically imported module") ||
    message.includes("error loading dynamically imported module") ||
    message.includes("importing a module script failed") ||
    message.includes("unable to preload css")
  );
}

/**
 * Reloads the page to pick up the new deploy's index.html. Returns false if we
 * already tried within the cooldown, meaning the caller should surface the
 * error instead of looping.
 */
export function reloadForNewDeploy(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_COOLDOWN_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // Private mode / storage disabled. Reloading once is still better than
    // showing the error, and without storage we cannot detect a loop anyway.
  }

  window.location.reload();
  return true;
}
