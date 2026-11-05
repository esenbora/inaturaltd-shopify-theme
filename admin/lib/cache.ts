/**
 * A small time-to-live cache for the panel's expensive reads.
 *
 * WHY THIS AND NOT NEXT'S CACHE.
 *
 * `unstable_cache` is marked replaced in Next 16, and the replacement
 * (`cacheComponents` + `use cache`) changes the render model of every route in
 * the app: reading request data outside a Suspense boundary becomes a build
 * error, and each page needs revisiting. This panel renders every page per
 * request on purpose, because the CSP in `proxy.ts` carries a per-request
 * nonce and a prerendered shell cannot carry one. Turning the whole app over
 * to Cache Components to memoise six figures on one dashboard is the wrong
 * trade, so the cache is local and explicit instead. It is the same in-memory
 * pattern the rate limiter and the audit ring already use, with the same
 * caveat: a single Railway instance, so this is accurate today, and it empties
 * on every deploy.
 *
 * WHAT IT BUYS.
 *
 * The dashboard reads Shopify, GA4 and Search Console. Those are per-URL,
 * sequential and quota-limited: Search Console in particular spends a daily
 * allowance belonging to the whole store. Without this, opening the dashboard
 * twice costs twice, and a dashboard nobody dares refresh is a dashboard
 * nobody reads.
 *
 * STALE ON FAILURE IS DELIBERATE.
 *
 * When a source fails and an older value is still held, the old value is
 * returned with `stale: true` rather than an error. A quota ceiling hit at
 * 11am should not blank the panel for the rest of the day; yesterday's figure
 * labelled as yesterday's is worth more than an empty card. The caller is
 * expected to show the age.
 */

interface Entry<T> {
  value: T;
  /** When this value was produced, in epoch milliseconds. */
  at: number;
}

/** Cached values, keyed by caller-supplied string. */
const store = new Map<string, Entry<unknown>>();

/**
 * Loads already running, keyed the same way.
 *
 * Without this, two tabs opening the dashboard at once would each start their
 * own Search Console sweep: double the quota for one answer. Sharing the
 * in-flight promise makes concurrent callers wait on the same work.
 */
const inflight = new Map<string, Promise<unknown>>();

export interface CacheRead<T> {
  value: T;
  /** When the value was produced, in epoch milliseconds. */
  fetchedAt: number;
  /** How old the value is, in milliseconds. */
  ageMs: number;
  /** True when the source failed and this is the last value held. */
  stale: boolean;
}

/**
 * Returns a cached value, refreshing it when it is older than `ttlMs`.
 *
 * Throws only when the source fails and nothing is held: there is genuinely
 * nothing to show in that case, and the caller's error branch is the honest
 * answer.
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  load: () => Promise<T>,
  now: number = Date.now(),
): Promise<CacheRead<T>> {
  const held = store.get(key) as Entry<T> | undefined;

  if (held && now - held.at < ttlMs) {
    return {
      value: held.value,
      fetchedAt: held.at,
      ageMs: now - held.at,
      stale: false,
    };
  }

  const running = inflight.get(key) as Promise<T> | undefined;
  if (running) {
    try {
      const value = await running;
      const entry = store.get(key) as Entry<T> | undefined;
      const at = entry?.at ?? now;
      return { value, fetchedAt: at, ageMs: now - at, stale: false };
    } catch (error) {
      // The shared load failed. Fall through to the same stale-or-throw
      // handling a solo caller would get.
      if (held) {
        return {
          value: held.value,
          fetchedAt: held.at,
          ageMs: Date.now() - held.at,
          stale: true,
        };
      }
      throw error;
    }
  }

  const promise = load();
  inflight.set(key, promise);

  try {
    const value = await promise;
    const at = Date.now();
    store.set(key, { value, at });
    return { value, fetchedAt: at, ageMs: 0, stale: false };
  } catch (error) {
    if (held) {
      return {
        value: held.value,
        fetchedAt: held.at,
        ageMs: Date.now() - held.at,
        stale: true,
      };
    }
    throw error;
  } finally {
    inflight.delete(key);
  }
}

/**
 * Drops a cached value so the next read goes to the source.
 *
 * Called after a mutation that invalidates a figure: publishing an article
 * should not leave the dashboard claiming the old draft count for the next
 * quarter of an hour.
 */
export function invalidate(key: string): void {
  store.delete(key);
}

/** Drops everything. Test seam, and the Refresh action on the dashboard. */
export function invalidateAll(): void {
  store.clear();
}

/** Describes an age in the shortest words that are still accurate. */
export function describeAge(ageMs: number): string {
  const seconds = Math.round(ageMs / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}
