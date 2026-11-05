/**
 * Audit trail for everything the panel changes.
 *
 * WHY.
 *
 * The panel can publish an article, rewrite a product description and delete a
 * product photo on the live store, and until now it kept no record that any of
 * it happened. Two people hold the shared password. When a description came
 * back wrong, or a draft went out early, there was nothing to look at: not who,
 * not when, not what it used to say. The Shopify admin's own log covers what
 * the Shopify UI did, not what this panel's API token did on its behalf.
 *
 * WHERE IT LIVES.
 *
 * Two places, deliberately.
 *
 *   1. One structured line per event on stdout. Railway retains these, which
 *      makes them the durable copy: they survive the deploy that restarts the
 *      container, and they can be searched after the fact.
 *   2. A bounded ring in memory, which is what the Activity page reads. It is
 *      lost on restart, and that is an acceptable trade for not introducing a
 *      database into a panel that otherwise needs none. The page says so
 *      rather than implying the list is complete.
 *
 * An audit record never carries the password, the session cookie, or any
 * Shopify token. It carries what changed and enough of the old value to
 * recognise it.
 */

/** How many events the in-memory ring holds before dropping the oldest. */
const RING_CAPACITY = 300;

export type AuditAction =
  | "login.success"
  | "login.failure"
  | "login.throttled"
  | "logout"
  | "article.create"
  | "article.update"
  | "article.delete"
  | "product.update"
  | "product.image.add"
  | "product.image.delete";

export interface AuditEvent {
  /** Milliseconds since the epoch. */
  at: number;
  action: AuditAction;
  /** Client address as seen behind the proxy. */
  ip: string;
  /** What was acted on: a Shopify id, a handle, a title. */
  subject?: string;
  /** Short human-readable detail. Never a secret. */
  detail?: string;
  /** False when the attempt was refused or failed. */
  ok: boolean;
}

const ring: AuditEvent[] = [];

/**
 * Records one event.
 *
 * Deliberately infallible: an audit write must never be the reason a product
 * edit fails. A logging error is swallowed after being reported once.
 */
export function audit(event: Omit<AuditEvent, "at"> & { at?: number }): void {
  const entry: AuditEvent = { at: event.at ?? Date.now(), ...event };

  ring.push(entry);
  if (ring.length > RING_CAPACITY) ring.splice(0, ring.length - RING_CAPACITY);

  try {
    // One line, parseable, so Railway's log search can find a day's deletions
    // without a human reading every line.
    console.log(
      JSON.stringify({
        tag: "audit",
        at: new Date(entry.at).toISOString(),
        action: entry.action,
        ok: entry.ok,
        ip: entry.ip,
        subject: entry.subject,
        detail: entry.detail,
      }),
    );
  } catch {
    // Nothing useful to do here. The ring still has it.
  }
}

/** The most recent events, newest first. */
export function recentAudit(limit: number = RING_CAPACITY): AuditEvent[] {
  return ring.slice(-limit).reverse();
}

/** How many events the ring is holding, for the "since restart" note. */
export function auditCount(): number {
  return ring.length;
}
