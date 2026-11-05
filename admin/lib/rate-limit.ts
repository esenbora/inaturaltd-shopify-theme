/**
 * Login throttling for the admin panel.
 *
 * WHY THIS EXISTS.
 *
 * The panel is guarded by one shared password and nothing else. Until now
 * `/api/auth/login` answered every request it was given, as fast as it could
 * hash: a script could sit on the public Railway URL and work through a word
 * list indefinitely, and nothing in the panel would look any different while
 * it did. A single shared secret with unlimited guesses is a secret with a
 * deadline on it.
 *
 * Two counters, because one is not enough:
 *   - Per client address. Stops the ordinary case, one source grinding away.
 *   - Across all addresses. A spread-out attempt defeats a per-address limit
 *     by never hitting it twice from the same place, so there is a ceiling on
 *     total failures too. It is set high enough that the real team, who get
 *     the password right, will never see it.
 *
 * State lives in memory. The panel runs as a single Railway instance, so this
 * is accurate today; if it is ever scaled to two, the per-instance limit still
 * holds but the effective ceiling doubles, and the counters would need to move
 * to shared storage. Written down here because that is the kind of thing that
 * silently stops being true.
 */

/** Failures from one address before it is locked out. */
const PER_IP_THRESHOLD = 5;

/** Failures across every address before all logins are locked out. */
const GLOBAL_THRESHOLD = 40;

/** How long a failure counts against its address. */
const WINDOW_MS = 15 * 60 * 1000;

/** Lockout durations, applied by how many thresholds have been crossed. */
const LOCKOUT_STEPS_MS = [60_000, 5 * 60_000, 30 * 60_000] as const;

/** Stop tracking an address this long after its last failure. */
const FORGET_MS = 60 * 60 * 1000;

interface Attempts {
  /** Failure timestamps inside the current window, oldest first. */
  failures: number[];
  /** How many times this address has been locked out. */
  lockouts: number;
  /** When the current lockout ends, or 0 when not locked out. */
  lockedUntil: number;
}

const perIp = new Map<string, Attempts>();
let globalFailures: number[] = [];

/** Drops entries nobody has touched for an hour, so the map cannot grow forever. */
function sweep(now: number): void {
  for (const [key, record] of perIp) {
    const last = record.failures.at(-1) ?? 0;
    if (now - last > FORGET_MS && now > record.lockedUntil) {
      perIp.delete(key);
    }
  }
  globalFailures = globalFailures.filter((at) => now - at < WINDOW_MS);
}

function freshRecord(): Attempts {
  return { failures: [], lockouts: 0, lockedUntil: 0 };
}

export interface RateLimitVerdict {
  /** True when the request must be refused without checking the password. */
  limited: boolean;
  /** Seconds the caller should wait, for the Retry-After header. */
  retryAfterSeconds: number;
  /** Which ceiling was hit, for the log line. */
  scope: "ip" | "global" | null;
}

const ALLOWED: RateLimitVerdict = {
  limited: false,
  retryAfterSeconds: 0,
  scope: null,
};

/**
 * Asks whether this address may attempt a login right now.
 *
 * Call before verifying the password: a locked-out request must not reach the
 * comparison at all, otherwise the lockout still leaks timing information
 * about whether a guess was close.
 */
export function checkLoginAllowed(
  ip: string,
  now: number = Date.now(),
): RateLimitVerdict {
  sweep(now);

  const record = perIp.get(ip);
  if (record && now < record.lockedUntil) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      scope: "ip",
    };
  }

  if (globalFailures.length >= GLOBAL_THRESHOLD) {
    const oldest = globalFailures[0];
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((oldest + WINDOW_MS - now) / 1000)),
      scope: "global",
    };
  }

  return ALLOWED;
}

/**
 * Records a failed attempt and returns the resulting verdict, so the caller
 * can tell the client how long the lockout it just earned will last.
 */
export function recordLoginFailure(
  ip: string,
  now: number = Date.now(),
): RateLimitVerdict {
  const record = perIp.get(ip) ?? freshRecord();

  record.failures = record.failures.filter((at) => now - at < WINDOW_MS);
  record.failures.push(now);
  globalFailures.push(now);

  if (record.failures.length >= PER_IP_THRESHOLD) {
    // Each lockout is longer than the last, so a patient script gains less
    // with every round. The final step repeats rather than growing without
    // bound, which would eventually lock an address out for days over what
    // might be a colleague fumbling the password manager.
    const step = Math.min(record.lockouts, LOCKOUT_STEPS_MS.length - 1);
    record.lockouts += 1;
    record.lockedUntil = now + LOCKOUT_STEPS_MS[step];
    record.failures = [];
  }

  perIp.set(ip, record);

  if (now < record.lockedUntil) {
    return {
      limited: true,
      retryAfterSeconds: Math.ceil((record.lockedUntil - now) / 1000),
      scope: "ip",
    };
  }
  return checkLoginAllowed(ip, now);
}

/** Clears an address's history after it authenticates successfully. */
export function clearLoginFailures(ip: string): void {
  perIp.delete(ip);
}

/**
 * The client address, as far as it can be trusted behind Railway's proxy.
 *
 * A client can send any `x-forwarded-for` it likes, so the leftmost entries
 * are attacker-controlled. Each proxy APPENDS the address it actually saw,
 * which makes the LAST entry the only one written by infrastructure we run
 * behind. Taking the first entry here, the usual mistake, would hand every
 * attacker a free way to reset their own rate limit on each request.
 */
export function clientAddress(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const hops = forwarded
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
    const last = hops.at(-1);
    if (last) return last;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

/**
 * A second, separate limiter for the endpoints that cost something real to
 * serve.
 *
 * `/api/index-coverage` inspects one URL per Google Search Console call with
 * ~400ms spacing, and `/api/analytics` and `/api/sales` reach GA4 and the
 * Shopify Admin API. The quota those share is a daily allowance for the whole
 * store, not a per-request cost, so a refresh held down on one screen can
 * spend the day's budget and leave the real reporting unable to load. This is
 * not an attack control; it is a brake on a tab in a loop.
 */
const costly = new Map<string, number[]>();

/** Requests allowed per key, per window. */
const COSTLY_LIMIT = 12;

/** The window those requests are counted over. */
const COSTLY_WINDOW_MS = 60_000;

/**
 * Asks whether this address may call an expensive endpoint right now.
 * Keyed per endpoint, so a slow sweep of one does not block another.
 */
export function checkCostlyAllowed(
  endpoint: string,
  ip: string,
  now: number = Date.now(),
): RateLimitVerdict {
  const key = `${endpoint}|${ip}`;
  const hits = (costly.get(key) ?? []).filter((at) => now - at < COSTLY_WINDOW_MS);

  if (hits.length >= COSTLY_LIMIT) {
    costly.set(key, hits);
    return {
      limited: true,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((hits[0] + COSTLY_WINDOW_MS - now) / 1000),
      ),
      scope: "ip",
    };
  }

  hits.push(now);
  costly.set(key, hits);

  // Bounded cleanup: this map only ever holds one entry per endpoint per
  // address, but a long-running container with changing addresses would
  // otherwise accumulate dead keys.
  if (costly.size > 500) {
    for (const [existing, times] of costly) {
      if (times.every((at) => now - at >= COSTLY_WINDOW_MS)) costly.delete(existing);
    }
  }

  return ALLOWED;
}

/** Test seam: forget everything. Not used by the running panel. */
export function resetRateLimitState(): void {
  perIp.clear();
  globalFailures = [];
  costly.clear();
}
