// Recovers from stale preview tabs: after a redeploy, an open tab can hold
// old script addresses, and a lazy-loaded module then fails with
// "Importing a module script failed" / "Failed to fetch dynamically imported
// module". Reload once per session so the tab picks up the fresh build.
const STALE_IMPORT_PATTERNS = [
  'Importing a module script failed',
  'Failed to fetch dynamically imported module',
  'error loading dynamically imported module',
  'Unable to preload CSS',
];

const RELOAD_FLAG = 'kamimatch:stale-chunk-reload';

function messageOf(event: Event | PromiseRejectionEvent): string {
  if ('reason' in event) {
    const reason = event.reason;
    return typeof reason === 'string' ? reason : String(reason?.message ?? reason);
  }
  if ('message' in event && typeof event.message === 'string') return event.message;
  const target = (event as ErrorEvent).error;
  return String(target?.message ?? '');
}

function isStaleImport(message: string): boolean {
  return STALE_IMPORT_PATTERNS.some((pattern) => message.includes(pattern));
}

function reloadOnce(): void {
  try {
    if (window.sessionStorage.getItem(RELOAD_FLAG)) return;
    window.sessionStorage.setItem(RELOAD_FLAG, '1');
  } catch {
    // Storage unavailable; reload anyway — the loop risk is acceptable here.
  }
  window.location.reload();
}

export function installStaleChunkRecovery(): void {
  if (typeof window === 'undefined') return;
  const handler = (event: Event | PromiseRejectionEvent) => {
    if (isStaleImport(messageOf(event))) reloadOnce();
  };
  window.addEventListener('error', handler);
  window.addEventListener('unhandledrejection', handler);
}

installStaleChunkRecovery();
